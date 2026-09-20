import { useContext, useEffect, useRef } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";
import { useConfirm } from "./ConfirmContext";

/**
 * Hook to protect forms and edit states from accidental data loss.
 * Intercepts:
 * 1. In-app navigation (React Router push, replace, go)
 * 2. Browser Back / Forward buttons (popstate)
 * 3. Tab close and page reload (beforeunload)
 *
 * @param {boolean} isDirty - Whether there are unsaved modifications
 * @param {object} options - Custom modal messages and titles
 */
export const useUnsavedChanges = (isDirty, options = {}) => {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const confirm = useConfirm();
  const isBypassingRef = useRef(false);
  const isRevertingRef = useRef(false);
  const currentIdxRef = useRef(window.history.state?.idx ?? 0);

  const title = options.title || "Unsaved Changes";
  const message =
    options.message ||
    "You have unsaved changes. If you leave this page, your changes will be lost.";
  const confirmText = options.confirmText || "Leave Page";
  const cancelText = options.cancelText || "Stay";

  // Helper for explicit cancel/discard actions (e.g. form Cancel button)
  const confirmDiscard = async () => {
    if (!isDirty) return true;
    return await confirm({
      title: options.discardTitle || "Discard Unsaved Changes?",
      message:
        options.discardMessage ||
        "You have unsaved changes. Are you sure you want to discard them?",
      confirmText: options.discardConfirmText || "Discard Changes",
      cancelText: options.discardCancelText || "Keep Editing",
      isDanger: true,
    });
  };

  useEffect(() => {
    if (!isDirty || !navigator) return;

    isBypassingRef.current = false;
    isRevertingRef.current = false;
    currentIdxRef.current = window.history.state?.idx ?? 0;

    const originalPush = navigator.push;
    const originalReplace = navigator.replace;
    const originalGo = navigator.go;

    const interceptNavigation = async (originalFn, ...args) => {
      if (isBypassingRef.current) {
        originalFn.apply(navigator, args);
        return;
      }

      const ok = await confirm({
        title,
        message,
        confirmText,
        cancelText,
        isDanger: true,
      });

      if (ok) {
        isBypassingRef.current = true;
        originalFn.apply(navigator, args);
      }
    };

    navigator.push = (...args) => interceptNavigation(originalPush, ...args);
    navigator.replace = (...args) => interceptNavigation(originalReplace, ...args);
    navigator.go = (...args) => interceptNavigation(originalGo, ...args);

    const handlePopState = async (e) => {
      if (isBypassingRef.current) return;

      if (isRevertingRef.current) {
        isRevertingRef.current = false;
        e.stopImmediatePropagation();
        return;
      }

      e.stopImmediatePropagation();

      const nextIdx = e.state?.idx ?? 0;
      const delta = nextIdx - currentIdxRef.current;

      // Revert the browser pointer so user stays on current page
      isRevertingRef.current = true;
      if (delta !== 0) {
        window.history.go(-delta);
      } else {
        window.history.forward();
      }

      const ok = await confirm({
        title,
        message,
        confirmText,
        cancelText,
        isDanger: true,
      });

      if (ok) {
        isBypassingRef.current = true;
        if (delta !== 0) {
          window.history.go(delta);
        } else {
          window.history.back();
        }
      }
    };

    const handleBeforeUnload = (e) => {
      if (isBypassingRef.current) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("popstate", handlePopState, true);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      navigator.push = originalPush;
      navigator.replace = originalReplace;
      navigator.go = originalGo;
      window.removeEventListener("popstate", handlePopState, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, navigator, confirm, title, message, confirmText, cancelText]);

  return { confirmDiscard };
};

export default useUnsavedChanges;
