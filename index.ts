import axios from 'axios';
import moment from 'moment';
import env from './env.json';
import RSS from 'rss-generator';

import { RoomMapping, RoomScheduleMap } from './types';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';

axios.defaults.baseURL = 'https://uconn.emscloudservice.com/platform/api/v1';

let { clientId, clientSecret: secret } = env;
let ROOM_NAME_REGEX = /^[a-zA-Z]{1,}\d{2,}[a-zA-Z]*$/;

(async () => {
    let authToken = await axios
        .post('/clientauthentication', { clientId, secret })
        .then(res => res.data)
        .then(res => res.clientToken)
        .catch(_ => null);

    if (!authToken) {
        console.warn('Failed to authenticate with EMS.');
        process.exit(-1);
    }

    axios.defaults.headers['x-ems-api-token'] = authToken;
    console.log('Authenticated with EMS.');

    let rooms = await axios
        .get('/rooms?pageSize=2000')
        .then(res => res.data)
        .then(res => res.results)
        .catch(err => {
            console.error('Failed to retrieve rooms:', err);
            return null;
        });

    if (!rooms || rooms.length === 0) {
        console.warn('Failed to fetch room mappings from EMS.');
        process.exit(-1);
    }

    let mappings: RoomMapping[] = rooms
        .filter(room => room.description.includes(' ') && ROOM_NAME_REGEX.test(room.description.replace(/\s+/g, '')))
        .map(room => ({
            name: room.building.code + ' ' + room.code,
            roomId: room.id,
            building: room.building.description,
            buildingId: room.building.id
        }));

    console.log(`Retrieved ${mappings.length} room mappings from EMS.`);
    
    let i = 0;
    let start = Date.now();
    let schedules: RoomScheduleMap = {};
    for (let room of mappings) {
        let schedule = await axios
            .get(`/bookings?roomId=${room.roomId}&pageSize=2000`)
            .then(res => res.data)
            .then(res => res.results)
            .then(res => res.filter(booking => new Date(booking.eventStartTime).toDateString() === new Date().toDateString()))
            .catch(_ => []);

        console.log(`[${++i}/${mappings.length}]`, room.name, schedule.length);
        
        if (!schedules[room.name])
            schedules[room.name] = [];

        schedules[room.name].push({
            name: room.name,
            events: schedule.map(booking => ({
                title: booking.eventName,
                description: `${moment(booking.eventStartTime).format('h:mm A')} - ${moment(booking.eventEndTime).format('h:mm A')}`
            }))
        });
    }

    console.log(`Retrieved ${Object.keys(schedules).length} room schedules from EMS in ${(Date.now() - start).toFixed(2)}ms.`);
    console.log('Starting export, this may take a moment..');

    let outDir = './signageData';
    if (existsSync(outDir)) {
        rmSync(outDir, { recursive: true });
        console.log('Signage Data export directory cleaned.');
    }
    
    mkdirSync(outDir);
    
    i = 0;
    start = Date.now();

    for (let [room, entry] of Object.entries(schedules)) {
        let clean = room.replace(/\s/g, '_');
        let feed = new RSS({
            title: room,
            description: moment().format('MM/DD/YYYY'),
            site_url: 'https://aitstatus.uconn.edu/',
            feed_url: `https://aittatus.uconn.edu/roomsignage/${clean}.xml`
        });

        entry
            .map(ent => ent.events)
            .flat()
            .forEach(({ title, description }) => feed.item({
                title, description
            }));

        writeFileSync(`./signageData/${clean}.xml`, feed.xml({ indent: true }));
        console.log(`[${++i}/${Object.keys(schedules).length}]`, room, entry.length);
    }

    console.log(`Export took ${(Date.now() - start).toFixed(2)}ms.`);
})();