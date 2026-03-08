const RouteAnnouncer = () => {
  return (
    <div
      id="route-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
};

export default RouteAnnouncer;
