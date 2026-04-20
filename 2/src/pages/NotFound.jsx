"use client"

import { Link } from "react-router-dom"
import { FiHome, FiArrowLeft } from "react-icons/fi"

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Página no encontrada</h2>
          <p className="mt-2 text-gray-600">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            to="/"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiHome className="mr-2" />
            Ir al Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="mr-2" />
            Volver Atrás
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, por favor{" "}
            <Link to="/contact" className="text-blue-600 hover:text-blue-500">
              contáctanos
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
