/**
 * Re-export all route-related utilities for easy imports
 *
 * Usage:
 * import { PUBLIC_ROUTES, PROTECTED_ROUTES, ROLES, useRoutes } from './routes';
 */

// Route paths constants
export {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  ERROR_ROUTES,
  ROUTE_TITLES,
  getRouteTitle,
} from "../constants/routes";

// Role constants
export {
  ROLES,
  ROLE_NAMES,
  isAdmin,
  isUser,
  getRoleName,
} from "../constants/roles";

// Route guards
export { default as ProtectedRoute } from "./guards/ProtectedRoute";
export { default as PublicRoute } from "./guards/PublicRoute";

// Custom hooks
export { useRoutes, useDocumentTitle, useRouteTitle } from "./hooks/useRoutes";

// Main router
export { default as router } from "./index";
