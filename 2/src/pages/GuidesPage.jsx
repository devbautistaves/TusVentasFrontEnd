
import { FiPlay, FiFileText, FiHelpCircle } from "react-icons/fi";
const Card = ({ children }) => <div className="bg-white shadow rounded p-4">{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;

const Tabs = ({ children }) => <div>{children}</div>;

const TabsContent = ({ value, children }) => <div>{children}</div>;
const GuidesPage = () => {
  return (
    <div className="p-6 ">
      <h1 className="text-2xl font-bold mb-4 text-center p-5">Guías y Tutoriales</h1>

      <Tabs defaultValue="videos" className="w-full  ">


     <TabsContent value="videos">
  <div className="flex justify-center">
    <div className="grid">
      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold mb-2 text-center">Cómo concretar una venta</h2>
          <iframe
            src="https://www.youtube.com/watch?v=8Pwgvy7gR8Y"
            title="Video tutorial"
            className="w-full aspect-video rounded"
            allowFullScreen
          ></iframe>
        </CardContent>
      </Card>
      {/* Agregar más videos si querés */}
    </div>
  </div>
</TabsContent>
        <TabsContent value="docs">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-2">Guía de estrategias de venta</h2>
                <p className="text-sm text-gray-600">Descargá o leé la guía completa en PDF.</p>
                <a
                  href="https://docs.google.com/document/d/1xQ5sKgnbCcKeqz8TbjGyYWaRYgNiov9NIL9LTJGHf-8/edit?usp=sharing"
                  className="text-blue-600 text-sm underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver documento
                </a>
              </CardContent>
            </Card>
            {/* Agregar más documentos */}
          </div>
        </TabsContent>

        <TabsContent value="faq">
  <div className="space-y-4">
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">¿Cómo modifico una venta ya cargada?</h2>
        <p className="text-sm text-gray-700">Podés editar una venta desde el historial haciendo clic en "Editar" en la línea correspondiente.</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">¿Qué pasa si el DNI del cliente no pasa el scoring?</h2>
        <p className="text-sm text-gray-700">Podés solicitar el DNI de un familiar. Siempre aclarale al cliente que la facturación seguirá estando a su nombre.</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">¿Cuándo se considera cerrada una venta?</h2>
        <p className="text-sm text-gray-700">Una venta se considera cerrada una vez el equipo este instalado.</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">¿Qué incluye la instalación gratuita?</h2>
        <p className="text-sm text-gray-700">La instalación incluye sensores, panel, sirena y configuración de la app, todo sin costo si el DNI es aprobado.</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">¿Cómo hago el seguimiento de una venta?</h2>
        <p className="text-sm text-gray-700">Tenés que mantener contacto con el cliente hasta que se realice la instalación. No se da por finalizada hasta entonces.</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">¿Puedo cargar ventas fuera de mi zona?</h2>
        <p className="text-sm text-gray-700">Sí, pero asegurate de que la zona esté habilitada para instalaciones. Consultalo si tenés dudas.</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">¿Qué hago si el cliente no responde después de aprobar el DNI?</h2>
        <p className="text-sm text-gray-700">Seguí insistiendo con respeto. Si en 48 hs no hay respuesta, notificá al equipo para dar seguimiento.</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">¿El video de bienvenida lo mando yo?</h2>
        <p className="text-sm text-gray-700">Si, el video te lo vamos a dejar en la seccion de objetos utiles y hooks!</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-2">¿Qué datos necesito para cargar una venta?</h2>
        <p className="text-sm text-gray-700">Nombre, DNI (foto FRONTAL y número), dirección, teléfono, y que acepte recibir el equipo sin abonar instalación.</p>
      </CardContent>
    </Card>
  </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuidesPage;
