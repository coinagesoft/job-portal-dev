"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useToast } from "@/components/Toast";
import {
  CANDIDATE_PROTECTED_PREFIXES,
  EMPLOYER_PROTECTED_PREFIXES,
  PUBLIC_ROUTE_EXCEPTIONS,
  ROLE_DEFAULT_ROUTE,
  ROUTE_PERMISSION_RULES,
  HR_MANAGER_ROLE,
} from "@/constants/panelConfig";

const isInProtectedGroup = (pathname, prefixes) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const isPublicException = (pathname) =>
  PUBLIC_ROUTE_EXCEPTIONS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

const matchingPermissionRule = (pathname) =>
  ROUTE_PERMISSION_RULES.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  );

const AuthRouteGuard = () => {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useToast();

  const role = useSelector((state) => state.auth.user?.role);
  const user = useSelector((state) => state.auth.user);

  const initialized = useSelector(
    (state) => state.auth.initialized
  );

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
      return;
    }

    // Sub-user permission gating — this only ever restricts a sub-user,
    // never the account owner. If permissions haven't loaded yet
    // (undefined), don't redirect on a false negative; only redirect once
    // we actually know the flag is false.
    if (role === "employer" && isEmployerRoute) {
      const rule = matchingPermissionRule(pathname);

      if (rule) {
        const isSubUser = user?.isSubUser === true;

        const lacksAccess = rule.hrManagerViewOnly
          ? isSubUser && user?.subUserRole !== HR_MANAGER_ROLE
          : rule.ownerOnly
          ? isSubUser
          : isSubUser && user?.[rule.permission] === false;

        if (lacksAccess) {
          showToast(
            "You don't have permission to access this page. Please contact your account owner.",
            "error"
          );
          router.replace(ROLE_DEFAULT_ROUTE.employer);
        }
      }
    }
  }, [pathname, role, user, initialized, router, showToast]);

  return null;
};

export default AuthRouteGuard;