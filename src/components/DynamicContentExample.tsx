import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DynamicContentExample = () => {
  const [items, setItems] = useState<string[]>(['Item 1', 'Item 2', 'Item 3']);
  const [announcement, setAnnouncement] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const newItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (newItemRef.current) {
      newItemRef.current.focus();
    }
  }, [items.length]);

  const addItem = () => {
    const newItem = `Item ${items.length + 1}`;
    setItems([...items, newItem]);
    setAnnouncement(`${newItem} added to list`);

    setTimeout(() => setAnnouncement(''), 3000);
  };

  const removeItem = (index: number) => {
    const removedItem = items[index];
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setAnnouncement(`${removedItem} removed from list`);

    setTimeout(() => setAnnouncement(''), 3000);

    if (newItems.length > 0) {
      const focusIndex = index > 0 ? index - 1 : 0;
      setTimeout(() => {
        const buttons = listRef.current?.querySelectorAll('button');
        if (buttons && buttons[focusIndex]) {
          buttons[focusIndex].focus();
        }
      }, 0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dynamic Content with Focus Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>

        <Button onClick={addItem} className="mb-4">
          Add Item
        </Button>

        <ul ref={listRef} className="space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              ref={index === items.length - 1 ? newItemRef : null}
              tabIndex={-1}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <span>{item}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeItem(index)}
                aria-label={`Remove ${item}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DynamicContentExample;
