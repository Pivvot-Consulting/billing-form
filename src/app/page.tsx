'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Users } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

type SelectionType = 'operator' | 'client' | null;

export default function Page() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<SelectionType>(null);

  const handleSelectOperator = () => {
    router.push(ROUTES.OPERATOR.LOGIN);
  };

  const handleSelectClient = () => {
    router.push(ROUTES.CLIENT.METODO_PAGO);
  };

  return (
    <main className="min-h-screen w-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido
          </h1>
          <p className="text-white">
            Selecciona cómo deseas continuar
          </p>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4 mb-6">
          {/* Operador Card */}
          <button
            onClick={handleSelectOperator}
            onMouseEnter={() => setHoveredCard('operator')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`
              w-full p-8 rounded-2xl border-3 transition-all duration-200
              flex flex-col items-center gap-4
              ${hoveredCard === 'operator' 
                ? 'bg-white border-blue-500 shadow-xl scale-[1.03]' 
                : 'bg-white border-blue-400 hover:shadow-lg hover:scale-[1.02]'
              }
            `}
          >
            <div className="p-4 rounded-full bg-blue-500 transition-colors">
              <UserCircle 
                size={64} 
                className="text-white" 
              />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-blue-600">
                Soy Operador
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona ventas y códigos
              </p>
            </div>
          </button>

          {/* Cliente Card */}
          <button
            onClick={handleSelectClient}
            onMouseEnter={() => setHoveredCard('client')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`
              w-full p-8 rounded-2xl border-3 transition-all duration-200
              flex flex-col items-center gap-4
              ${hoveredCard === 'client' 
                ? 'bg-white border-blue-500 shadow-xl scale-[1.03]' 
                : 'bg-white border-blue-400 hover:shadow-lg hover:scale-[1.02]'
              }
            `}
          >
            <div className="p-4 rounded-full bg-blue-500 transition-colors">
              <Users 
                size={64} 
                className="text-white" 
              />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-blue-600">
                Soy Cliente
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Realiza tu compra o renta
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-white">
            Arrendamiento de vehículo eléctrico
          </p>
        </div>
      </div>
    </main>
  );
}
