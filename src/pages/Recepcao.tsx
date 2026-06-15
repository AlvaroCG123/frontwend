import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Search, UserCheck } from 'lucide-react';

// Tipagem: O "molde" do Convidado que vem da sua API
interface Convidado {
  id: number;
  nome: string;
  sobrenome: string;
  mesa: number;
  status: boolean;
}

export function Recepcao() {
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [busca, setBusca] = useState('');

  // 1. Carregar a lista do Backend
  const buscarConvidados = async () => {
    try {
      const resposta = await api.get('/convidado/listar');
      setConvidados(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar lista de convidados", error);
    }
  };

  useEffect(() => {
    buscarConvidados();
  }, []);

  // 2. Fazer o Check-in
  const fazerCheckin = async (id: number) => {
    try {
      await api.patch(`/convidado/checkin/${id}`);
      buscarConvidados(); // Recarrega a lista para atualizar a tela
    } catch (error) {
      alert("Falha no check-in. O convidado já pode ter entrado.");
    }
  };

  // 3. Filtrar a lista pela barra de pesquisa
  const listaFiltrada = convidados.filter(convidado => {
    const nomeCompleto = `${convidado.nome} ${convidado.sobrenome}`.toLowerCase();
    return nomeCompleto.includes(busca.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-6 mt-4">
          <h1 className="text-3xl font-bold text-gray-800">Check-in</h1>
          <p className="text-gray-500">Controle de acesso do evento</p>
        </header>
        
        {/* Barra de Pesquisa */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar convidado..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg bg-white"
          />
        </div>

        {/* Lista de Convidados */}
        <div className="flex flex-col gap-4">
          {listaFiltrada.map((convidado) => (
            <div key={convidado.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{convidado.nome} {convidado.sobrenome}</h2>
                <p className="text-gray-500 font-medium mt-1">Mesa {convidado.mesa}</p>
              </div>
              
              {convidado.status ? (
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold">
                  <UserCheck size={20} />
                  <span>Entrou</span>
                </div>
              ) : (
                <button 
                  onClick={() => fazerCheckin(convidado.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow transition-all active:scale-95"
                >
                  Check-in
                </button>
              )}
            </div>
          ))}
          
          {listaFiltrada.length === 0 && (
            <div className="text-center text-gray-500 mt-8 p-6 bg-white rounded-xl border border-dashed">
              Nenhum convidado encontrado.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}