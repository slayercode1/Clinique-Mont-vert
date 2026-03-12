import axios, { type AxiosError } from 'axios';
import type { Request, Response } from 'express';

const serviceRoutes = {
  it: 'http://localhost:3001',
  fleet: 'http://localhost:3002',
};

const ALLOWED_FORWARD_HEADERS = ['authorization', 'content-type', 'accept', 'accept-language'];

const ALLOWED_RESPONSE_HEADERS = ['content-type', 'cache-control', 'x-request-id'];

export const proxy = async (request: Request, response: Response): Promise<any> => {
  const serviceName = request.params.service;
  const serviceUrl = (serviceRoutes as { [key: string]: string })[serviceName];

  if (!serviceUrl) {
    return response.status(404).json({ error: 'Service not found' });
  }

  try {
    const filteredHeaders: Record<string, string> = {};
    for (const key of ALLOWED_FORWARD_HEADERS) {
      const value = request.headers[key];
      if (value && typeof value === 'string') {
        filteredHeaders[key] = value;
      }
    }

    const responseFromAxios = await axios({
      method: request.method,
      url: `${serviceUrl}${request.path}`,
      data: request.body,
      headers: filteredHeaders,
    });

    const responseHeaders: Record<string, string> = {};
    for (const key of ALLOWED_RESPONSE_HEADERS) {
      const value = responseFromAxios.headers[key];
      if (value) {
        responseHeaders[key] = String(value);
      }
    }

    return response
      .status(responseFromAxios.status)
      .set(responseHeaders)
      .send(responseFromAxios.data);
  } catch (err) {
    const error = err as AxiosError;
    response
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: 'Internal server error' });
  }
};
