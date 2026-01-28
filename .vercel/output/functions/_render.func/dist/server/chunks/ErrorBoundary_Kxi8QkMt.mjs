import { jsx, jsxs } from 'react/jsx-runtime';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsx("div", { className: "min-h-[200px] flex items-center justify-center p-6", children: /* @__PURE__ */ jsx("div", { className: "max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-red-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-red-800", children: "Произошла ошибка" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 text-sm text-red-700", children: [
            /* @__PURE__ */ jsx("p", { children: "Компонент не смог загрузиться из-за ошибки." }),
            this.state.error && /* @__PURE__ */ jsxs("details", { className: "mt-2", children: [
              /* @__PURE__ */ jsx("summary", { className: "cursor-pointer hover:underline", children: "Подробности" }),
              /* @__PURE__ */ jsx("pre", { className: "mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32", children: this.state.error.toString() })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              },
              className: "text-sm font-medium text-red-800 hover:text-red-900",
              children: "Перезагрузить страницу →"
            }
          ) })
        ] })
      ] }) }) });
    }
    return this.props.children;
  }
}

export { ErrorBoundary as E };
