import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AccessibleModal from '@/components/AccessibleModal';
import DynamicContentExample from '@/components/DynamicContentExample';
import { useAnnouncePageChange } from '@/hooks/useFocusManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FocusDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  useAnnouncePageChange('Focus Management Demo');

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-2" tabIndex={-1}>
            Focus Management Demo
          </h1>
          <p className="text-muted-foreground">
            Demonstrating WCAG 2.1 Success Criterion 2.4.3 compliance
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Modal Dialog with Focus Trap</CardTitle>
            <CardDescription>
              Focus is trapped within the modal when open and restored to the trigger button on close
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </CardContent>
        </Card>

        <DynamicContentExample />

        <Card>
          <CardHeader>
            <CardTitle>Focus Management Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside">
              <li>Skip links appear at the top when tabbing</li>
              <li>Focus moves to page heading on route changes</li>
              <li>Modal dialogs trap focus and restore it on close</li>
              <li>Dynamic content updates announce changes to screen readers</li>
              <li>Focus returns to appropriate elements after deletions</li>
              <li>All interactive elements have visible focus indicators</li>
              <li>Keyboard navigation works throughout the application</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WCAG 2.1 Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Success Criterion 2.4.3 - Focus Order</h3>
                <p className="text-sm text-muted-foreground">
                  Focus order preserves meaning and operability. Components receive focus in an order that follows sequences and relationships within the content.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Additional Criteria Met</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>2.1.1 - Keyboard: All functionality available via keyboard</li>
                  <li>2.1.2 - No Keyboard Trap: Focus can be moved away from components</li>
                  <li>2.4.1 - Bypass Blocks: Skip links provided</li>
                  <li>2.4.7 - Focus Visible: Focus indicators are visible</li>
                  <li>4.1.3 - Status Messages: Screen reader announcements for dynamic content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Accessible Modal Dialog"
        description="This modal demonstrates proper focus management with focus trapping and restoration."
      >
        <div className="space-y-4">
          <p>
            When this modal opens, focus is moved to the first focusable element (the close button).
            Focus is trapped within the modal, cycling through interactive elements.
          </p>
          <p>
            Try pressing Tab to navigate forward and Shift+Tab to navigate backward.
            Press Escape or click the close button to close the modal.
          </p>
          <p>
            When the modal closes, focus returns to the button that opened it.
          </p>
          <div className="flex gap-2 pt-4">
            <Button>First Button</Button>
            <Button variant="secondary">Second Button</Button>
            <Button variant="outline">Third Button</Button>
          </div>
        </div>
      </AccessibleModal>
    </main>
  );
};

export default FocusDemo;
