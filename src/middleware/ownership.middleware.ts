import { Request, Response, NextFunction } from 'express';

// Extend the Express Request interface to securely hold user context
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const verifyResourceOwnership = (
  fetchResourceOwnerId: (req: Request) => Promise<string | null>
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        res.status(401).json({ 
          status: 'fail', 
          message: 'Authentication required to complete this action.' 
        });
        return;
      }

      // Query the database context dynamically to discover the true resource owner
      const resourceOwnerId = await fetchResourceOwnerId(req);

      if (!resourceOwnerId) {
        res.status(404).json({ 
          status: 'fail', 
          message: 'Requested resource could not be found.' 
        });
        return;
      }

      // Core Anti-IDOR Check: Block access if the record belongs to someone else
      if (resourceOwnerId !== currentUserId) {
        console.warn(`[SECURITY ALERT] User ${currentUserId} attempted unauthorized access to a resource owned by ${resourceOwnerId}`);
        res.status(403).json({ 
          status: 'fail', 
          message: 'Access Denied: You do not possess structural ownership permissions for this record.' 
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        message: 'Internal authorization validation failure.' 
      });
    }
  };
};