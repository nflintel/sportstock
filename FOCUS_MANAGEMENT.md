# Focus Management Implementation Guide

This document describes the focus management implementation in the application, ensuring WCAG 2.1 Success Criterion 2.4.3 compliance.

## Overview

The application implements comprehensive focus management strategies including:
- Skip links for quick navigation
- Focus trapping in modal dialogs
- Focus restoration after modal close
- Route change focus handling
- Dynamic content announcements
- Visible focus indicators

## Components

### 1. Skip Links (`src/components/SkipLinks.tsx`)

Skip links appear at the top of the page when tabbing and allow users to:
- Skip to main content
- Skip to navigation
- Skip to footer

**Usage:**
```tsx
import SkipLinks from '@/components/SkipLinks';

// Already added to App.tsx
<SkipLinks />
```

### 2. Focus Trap Hook (`src/hooks/useFocusManagement.ts`)

#### `useFocusTrap(isActive: boolean)`
Traps focus within a container when active and restores focus on deactivation.

**Usage:**
```tsx
import { useFocusTrap } from '@/hooks/useFocusManagement';

const MyModal = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
};
```

#### `useFocusReturn()`
Manually save and restore focus.

**Usage:**
```tsx
import { useFocusReturn } from '@/hooks/useFocusManagement';

const MyComponent = () => {
  const { saveFocus, restoreFocus } = useFocusReturn();

  const handleAction = () => {
    saveFocus();
    // Do something
    restoreFocus();
  };
};
```

#### `useAnnouncePageChange(pageName: string)`
Announces page changes to screen readers and moves focus to the main heading.

**Usage:**
```tsx
import { useAnnouncePageChange } from '@/hooks/useFocusManagement';

const MyPage = () => {
  useAnnouncePageChange('My Page Name');

  return (
    <main>
      <h1>My Page Name</h1>
      {/* Page content */}
    </main>
  );
};
```

#### `useFocusOnMount(shouldFocus?: boolean)`
Focuses an element when the component mounts.

**Usage:**
```tsx
import { useFocusOnMount } from '@/hooks/useFocusManagement';

const MyComponent = () => {
  const headingRef = useFocusOnMount(true);

  return <h1 ref={headingRef}>Heading</h1>;
};
```

### 3. Accessible Modal (`src/components/AccessibleModal.tsx`)

A fully accessible modal component with:
- Focus trapping
- Escape key handling
- Focus restoration
- Proper ARIA attributes

**Usage:**
```tsx
import AccessibleModal from '@/components/AccessibleModal';

const [isOpen, setIsOpen] = useState(false);

<AccessibleModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  description="Optional description"
>
  <p>Modal content goes here</p>
</AccessibleModal>
```

### 4. Route Announcer (`src/components/RouteAnnouncer.tsx`)

A hidden live region that announces route changes to screen readers.

**Usage:**
Already integrated in `App.tsx`. No additional setup needed.

### 5. Focus Manager (`src/components/FocusManager.tsx`)

Automatically manages focus when routes change, moving focus to the main heading or main content area.

**Usage:**
Already integrated in `App.tsx`. No additional setup needed.

## Best Practices

### 1. Page Structure

Every page should have a main landmark and a heading:

```tsx
const MyPage = () => {
  useAnnouncePageChange('My Page');

  return (
    <main>
      <h1 tabIndex={-1}>My Page</h1>
      {/* Content */}
    </main>
  );
};
```

### 2. Dynamic Content Updates

When content updates dynamically, announce changes and manage focus:

```tsx
const DynamicList = () => {
  const [items, setItems] = useState([]);
  const [announcement, setAnnouncement] = useState('');

  const addItem = () => {
    setItems([...items, newItem]);
    setAnnouncement('Item added');
    // Focus new item if appropriate
  };

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {/* List content */}
    </>
  );
};
```

### 3. Modal Dialogs

Use the existing Radix UI Dialog component or AccessibleModal:

```tsx
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// Radix UI handles focus management automatically
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>Dialog Title</DialogTitle>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### 4. Focus Indicators

All focusable elements have visible focus indicators via CSS:

```css
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### 5. Screen Reader Only Content

Use the `.sr-only` class for content only visible to screen readers:

```tsx
<span className="sr-only">Close dialog</span>
```

## WCAG 2.1 Compliance

### Success Criterion 2.4.3 - Focus Order (Level A)

**Requirement:** If a Web page can be navigated sequentially and the navigation sequences affect meaning or operation, focusable components receive focus in an order that preserves meaning and operability.

**Implementation:**
- Focus moves logically through the page
- Skip links allow bypassing repetitive content
- Focus is managed appropriately during route changes
- Modal dialogs trap and restore focus correctly
- Dynamic content updates maintain logical focus flow

### Additional Criteria Met

- **2.1.1 Keyboard:** All functionality is available via keyboard
- **2.1.2 No Keyboard Trap:** Focus can be moved away from all components
- **2.4.1 Bypass Blocks:** Skip links provided
- **2.4.7 Focus Visible:** All interactive elements have visible focus indicators
- **4.1.3 Status Messages:** Screen reader announcements for dynamic content

## Testing

### Manual Testing Checklist

1. **Skip Links:**
   - [ ] Tab on page load shows skip links
   - [ ] Skip links navigate to correct landmarks
   - [ ] Skip links disappear when not focused

2. **Keyboard Navigation:**
   - [ ] Tab key moves focus forward logically
   - [ ] Shift+Tab moves focus backward
   - [ ] No keyboard traps exist
   - [ ] All interactive elements are keyboard accessible

3. **Modal Dialogs:**
   - [ ] Focus moves to modal when opened
   - [ ] Tab cycles through modal elements only
   - [ ] Escape key closes modal
   - [ ] Focus returns to trigger on close

4. **Route Changes:**
   - [ ] Focus moves to page heading on navigation
   - [ ] Route changes are announced to screen readers
   - [ ] Focus order remains logical after navigation

5. **Dynamic Content:**
   - [ ] Content additions are announced
   - [ ] Focus moves appropriately to new content
   - [ ] Content removals restore focus correctly

### Automated Testing

Use tools like:
- **axe DevTools:** Browser extension for accessibility testing
- **WAVE:** Web accessibility evaluation tool
- **Lighthouse:** Chrome DevTools accessibility audit
- **NVDA/JAWS:** Screen reader testing

## Demo Page

Visit `/focus-demo` to see all focus management features in action with interactive examples.

## Support

For questions or issues related to focus management, refer to:
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Radix UI Documentation](https://www.radix-ui.com/)
