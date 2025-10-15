/**
 * Utility function to close DaisyUI dropdowns by blurring the active element.
 * Call this in click handlers for dropdown menu items.
 * Not using Popover API as Firefox and Safari has issues with it.
 */
export const closeDropdown = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};
