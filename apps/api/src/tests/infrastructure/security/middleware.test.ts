import { describe, it, expect, mock } from 'bun:test';
import type { Request, Response, NextFunction } from 'express';
import {
  requestLogger,
  graphqlRateLimit,
  adminIPWhitelist,
  csrfProtection,
  requestSizeLimit,
} from '../../../infrastructure/security/middleware';

// Mock request and response objects
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    url: '/test',
    path: '/test',
    headers: {},
    body: {},
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' },
    ...overrides,
  } as Request;
}

function createMockResponse(): Response {
  const res = {
    statusCode: 200,
    get: mock(() => '100'),
    on: mock((event: string, callback: Function) => {
      if (event === 'finish') {
        setTimeout(callback, 0);
      }
    }),
    status: mock((code: number) => res),
    json: mock((data: any) => res),
  };
  return res as any;
}

describe('Security Middleware', () => {
  describe('requestLogger', () => {
    it('should log HTTP requests', (done) => {
      const req = createMockRequest({
        method: 'POST',
        url: '/api/test',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      requestLogger(req, res, next);

      expect(next).toHaveBeenCalled();

      // Wait for the 'finish' event to be triggered
      setTimeout(() => {
        expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
        done();
      }, 10);
    });
  });

  describe('graphqlRateLimit', () => {
    it('should allow simple queries', () => {
      const req = createMockRequest({
        body: { query: '{ user { id name } }' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      graphqlRateLimit(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block complex queries', () => {
      const complexQuery = `
        query {
          user {
            profile {
              wallet {
                transactions {
                  order {
                    items {
                      product {
                        category {
                          products {
                            reviews {
                              user {
                                profile {
                                  wallet {
                                    transactions
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const req = createMockRequest({
        body: { query: complexQuery },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      graphqlRateLimit(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Query too complex',
        })
      );
    });

    it('should handle empty queries', () => {
      const req = createMockRequest({
        body: {},
      });
      const res = createMockResponse();
      const next = mock(() => {});

      graphqlRateLimit(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('adminIPWhitelist', () => {
    it('should allow requests from whitelisted IPs', () => {
      const middleware = adminIPWhitelist(['127.0.0.1', '192.168.1.1']);
      const req = createMockRequest({
        ip: '127.0.0.1',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block requests from non-whitelisted IPs', () => {
      const middleware = adminIPWhitelist(['192.168.1.1']);
      const req = createMockRequest({
        ip: '10.0.0.1',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access denied',
        })
      );
    });

    it('should skip checking if no IPs configured', () => {
      const middleware = adminIPWhitelist([]);
      const req = createMockRequest({
        ip: '10.0.0.1',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('csrfProtection', () => {
    it('should skip CSRF for GraphQL', () => {
      const req = createMockRequest({
        path: '/graphql',
        method: 'POST',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should skip CSRF for GET requests', () => {
      const req = createMockRequest({
        method: 'GET',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should require CSRF token for POST requests', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/api/test',
      });
      const res = createMockResponse();
      const next = mock(() => {});

      csrfProtection(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'CSRF token required',
        })
      );
    });
  });

  describe('requestSizeLimit', () => {
    it('should allow requests within size limit', () => {
      const middleware = requestSizeLimit(1024); // 1KB
      const req = createMockRequest({
        headers: { 'content-length': '500' },
      });
      const res = createMockResponse();
      const next = mock(() => {});

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should block requests exceeding size limit', () => {
      const middleware = requestSizeLimit(1024); // 1KB
      const req = createMockRequest({
        headers: { 'content-length': '2048' }, // 2KB
      });
      const res = createMockResponse();
      const next = mock(() => {});

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Request too large',
        })
      );
    });

    it('should handle missing content-length header', () => {
      const middleware = requestSizeLimit(1024);
      const req = createMockRequest({
        headers: {},
      });
      const res = createMockResponse();
      const next = mock(() => {});

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});