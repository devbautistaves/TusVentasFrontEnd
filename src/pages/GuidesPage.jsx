
import { FiPlay, FiFileText, FiHelpCircle } from "react-icons/fi";
const Card = ({ children }) => <div className="bg-white shadow rounded p-4">{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;

const Tabs = ({ children }) => <div>{children}</div>;
const TabsList = ({ children }) => <div className="flex gap-2 mb-4">{children}</div>;
const TabsTrigger = ({ value, children }) => <button className="px-3 py-1 rounded bg-gray-100">{children}</button>;
const TabsContent = ({ value, children }) => <div>{children}</div>;
const GuidesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Guías y Tutoriales</h1>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="videos"><FiPlay className="inline mr-2" /> Videos</TabsTrigger>
          <TabsTrigger value="docs"><FiFileText className="inline mr-2" /> Documentos</TabsTrigger>
          <TabsTrigger value="faq"><FiHelpCircle className="inline mr-2" /> Preguntas Frecuentes</TabsTrigger>
        </TabsList>

        <TabsContent value="videos">
          <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-2">Cómo concretar una venta</h2>
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Video tutorial"
                  className="w-full aspect-video rounded"
                  allowFullScreen
                ></iframe>
              </CardContent>
            </Card>
            {/* Agregar más videos si querés */}
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
            {/* Agregar más preguntas frecuentes */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuidesPage;
