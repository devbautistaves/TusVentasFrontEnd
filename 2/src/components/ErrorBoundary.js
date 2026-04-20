"use client"

import React from "react"
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-lg font-medium text-gray-900">Algo salió mal</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Ha ocurrido un error inesperado. Por favor, recarga la página.
                </p>

                <button
                  onClick={this.handleReload}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiRefreshCw className="mr-2 h-4 w-4" />
                  Recargar página
                </button>

                {process.env.NODE_ENV === "development" && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500">Detalles del error (desarrollo)</summary>
                    <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
                      {this.state.error && this.state.error.toString()}
                      <br />
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
