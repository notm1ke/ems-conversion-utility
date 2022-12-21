# EMS Conversion Utility

![version badge](https://img.shields.io/badge/version-1.0.0-2573bc)

This repository contains a tool used to generate RSS feeds from the [UConn EMS Cloud instance](https://uconn.emscloudservice.com). This tool is used internally to power the Carousel room signage used throughout the university.

## Quick Start

Use npm to install the required dependencies.

```bash
npm install
```

Now, provide the required credentials to authenticate with EMS. An example environment file is included, it can be renamed to ``env.json`` and filled out with the required credentials.

```json
{
    "clientId": "CLIENT_ID",
    "clientSecret": "CLIENT_SECRET"
}
```

### Obtaining Credentials

If you are a university employee or affiliate and intend to use this tool for UConn data (and do not already have access) please send a ticket over to IAM in order to obtain API access.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)