import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class RouteErrorBoundary extends Component {
  state = { failed: false, locationKey: this.props.locationKey };

  static getDerivedStateFromProps({ locationKey }, state) {
    return locationKey === state.locationKey ? null : { failed: false, locationKey };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white p-6 text-center text-(--deep-sea)">
        <p role="alert" className="font-workSans-bold">No pudimos cargar esta página.</p>
        <Link to={this.props.home} replace className="underline">Volver al inicio</Link>
      </main>
    );
  }
}
