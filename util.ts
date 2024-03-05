import axios from 'axios';

import { PaginatedApiResponse } from './types';
import { Method, AxiosRequestConfig } from 'axios';

export const STANDARD_TIME_FORMAT = 'YYYY-MM-DD[T]00:00:00-04:00';

export const paginate = async <TResponse, TBody = undefined>(action: string, method: Method, url: string, data?: TBody) => {
    const getNextPage = (response: PaginatedApiResponse<TResponse>) => {
        if (!response) return 1;
        return response.page + 1;
    };
    
    const _paginator = async (
        url: string,
        response: PaginatedApiResponse<TResponse>,
        results: TResponse[],
        body?: TBody
    ) => {
        if (response && (response.page === response.pageCount))
            return results;

        let page = getNextPage(response);
        let pagedUrl = url.includes('?')
            ? `${url}&page=${page}`
            : `${url}?page=${page}`;

        console.log(`[${action}] Collecting page ${page} for ${method} ${url} ..`);
        
        let config: AxiosRequestConfig = { method, data };
        let res = await axios(pagedUrl, config)
            .then(res => res.data)
            .then(data => data as PaginatedApiResponse<TResponse>)
            .catch(_ => null);

        if (!res) return results;
        return await _paginator(
            url, res,
            results.concat(res.results),
            body
        );
    }

    return await _paginator(url, undefined, [], data);
}