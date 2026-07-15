"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  CANDIDATE_PROTECTED_PREFIXES,
  EMPLOYER_PROTECTED_PREFIXES,
  PUBLIC_ROUTE_EXCEPTIONS,
  ROLE_DEFAULT_ROUTE,
} from "@/constants/panelConfig";

const isInProtectedGroup = (pathname, prefixes) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const isPublicException = (pathname) =>
  PUBLIC_ROUTE_EXCEPTIONS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

const AuthRouteGuard = () => {
 const pathname = usePathname();
const router = useRouter();

const role = useSelector(
  (state) => state.auth.user?.role
);

const initialized = useSelector(
  (state) => state.auth.initialized
);

console.log("ROLE", role);
console.log("INITIALIZED", initialized);

useEffect(() => {
  if (!initialized) return;

  if (!pathname) return;

  // Public pages that live under an otherwise-protected prefix (e.g. a
  // sub-user invite link under /employeer/) must never be redirected —
  // whoever opens them may not be logged in at all, or may be logged in
  // as a completely different account on that device.
  if (isPublicException(pathname)) return;

  const isCandidateRoute =
    isInProtectedGroup(
      pathname,
      CANDIDATE_PROTECTED_PREFIXES
    );

  const isEmployerRoute =
    isInProtectedGroup(
      pathname,
      EMPLOYER_PROTECTED_PREFIXES
    );

  const isProtectedRoute =
    isCandidateRoute || isEmployerRoute;

  if (!isProtectedRoute) return;

  if (!role) {
    router.replace("/Login");
    return;
  }

  if (
    role === "candidate" &&
    isEmployerRoute
  ) {
    router.replace(
      ROLE_DEFAULT_ROUTE.candidate
    );
    return;
  }

  if (
    role === "employer" &&
    isCandidateRoute
  ) {
    router.replace(
      ROLE_DEFAULT_ROUTE.employer
    );
  }
}, [pathname, role, initialized, router]);

  return null;
};

export default AuthRouteGuard;