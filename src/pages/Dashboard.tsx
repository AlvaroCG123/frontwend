import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../services/api';
import { Users, CheckCircle, Clock, Trash2, Pencil, X, Printer, Loader, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Convidado {
  id: number;
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  email: string;
  mesa: number;
  status: boolean;
}

interface FormConvidado {
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  email: string;
  mesa: number;
  status: boolean;
}

export function Dashboard() {
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false); // Estado de Loading
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormConvidado>();

  const carregarConvidados = async () => {
    try {
      const resposta = await api.get('/convidado/listar');
      setConvidados(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar convidados", error);
    }
  };

  const navigate = useNavigate()

  const fazerLogout = ()=>{
    localStorage.removeItem('token')
    navigate('/login')
  }

  useEffect(() => {
    carregarConvidados();
  }, []);

  const lidarComEnvio = async (dados: FormConvidado) => {
    setCarregando(true); // Inicia o loading
    try {
      dados.mesa = Number(dados.mesa);
      
      if (editandoId) {
        dados.status = convidados.find(c => c.id === editandoId)?.status || false;
        await api.put(`/convidado/atualizar/${editandoId}`, dados);
        alert("Convidado atualizado com sucesso!");
      } else {
        dados.status = false; 
        await api.post('/convidado/criar', dados);
        alert("Convidado registado com sucesso!");
      }
      
      cancelarEdicao();
      carregarConvidados(); 
    } catch (error) {
      alert("Erro ao salvar. Verifique se o CPF ou E-mail já existem.");
    } finally {
      setCarregando(false); // Finaliza o loading dando certo ou errado
    }
  };

  const prepararEdicao = (convidado: Convidado) => {
    setEditandoId(convidado.id);
    reset({
      nome: convidado.nome,
      sobrenome: convidado.sobrenome,
      cpf: convidado.cpf,
      telefone: convidado.telefone,
      email: convidado.email,
      mesa: convidado.mesa,
      status: convidado.status
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    reset({ nome: '', sobrenome: '', cpf: '', telefone: '', email: '', mesa: 0 });
  };

  const deletarConvidado = async (id: number) => {
    const confirmar = window.confirm("Tens a certeza que desejas excluir este convidado?");
    if (!confirmar) return;

    try {
      await api.delete(`/convidado/deletar/${id}`);
      carregarConvidados();
    } catch (error) {
      alert("Erro ao excluir convidado.");
    }
  };

  const totalConvidados = convidados.length;
  const confirmados = convidados.filter(c => c.status).length;
  const pendentes = totalConvidados - confirmados;

  return (
    <main className="min-h-screen bg-gray-50 p-8 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end border-b pb-4 print:border-none">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Painel de Gestão</h1>
            <p className="text-gray-500">Senac Wedding - Visão Administrativa</p>
          </div>
          {/* Botão de Exportar - Fica oculto na impressão (print:hidden) */}
          <button 
            onClick={() => window.print()}
            className="print:hidden flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Printer size={20} />
            Exportar Relatório
          </button>

          <button 
              onClick={fazerLogout}
              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <LogOut size={20} />
              Sair
            </button>
        </header>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 print:border-gray-300 print:shadow-none">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600 print:bg-transparent print:p-0"><Users size={28} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Convidados</p>
              <p className="text-2xl font-bold text-gray-800">{totalConvidados}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 print:border-gray-300 print:shadow-none">
            <div className="bg-green-100 p-4 rounded-full text-green-600 print:bg-transparent print:p-0"><CheckCircle size={28} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Confirmados</p>
              <p className="text-2xl font-bold text-gray-800">{confirmados}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 print:border-gray-300 print:shadow-none">
            <div className="bg-orange-100 p-4 rounded-full text-orange-600 print:bg-transparent print:p-0"><Clock size={28} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-gray-800">{pendentes}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
          
          {/* FORMULÁRIO - Fica oculto na impressão */}
          <div className="print:hidden lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editandoId ? 'Editar Convidado' : 'Adicionar Convidado'}
              </h2>
              {editandoId && (
                <button onClick={cancelarEdicao} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(lidarComEnvio)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Nome" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('nome', { required: true })} />
                <input type="text" placeholder="Sobrenome" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('sobrenome', { required: true })} />
              </div>
              <input type="text" placeholder="CPF" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('cpf', { required: true })} />
              <input type="email" placeholder="E-mail" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('email', { required: true })} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Telefone" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('telefone', { required: true })} />
                <input type="number" placeholder="Nº Mesa" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('mesa', { required: true, min: 1 })} />
              </div>

              <button 
                type="submit" 
                disabled={carregando}
                className={`w-full flex justify-center items-center gap-2 text-white font-bold py-2 rounded transition mt-2 
                ${editandoId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'}
                ${carregando ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {carregando && <Loader className="animate-spin" size={18} />}
                {editandoId ? 'Atualizar Dados' : 'Registar Convidado'}
              </button>
            </form>
          </div>

          {/* TABELA - Ocupa 100% da largura na impressão */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:w-full print:border-gray-300 print:shadow-none">
            <div className="p-6 border-b border-gray-100 print:p-4">
              <h2 className="text-xl font-bold text-gray-800">Lista de Presença</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm print:bg-gray-200 print:text-black">
                  <tr>
                    <th className="p-4 font-medium">Nome Completo</th>
                    <th className="p-4 font-medium">Contactos</th>
                    <th className="p-4 font-medium">Mesa</th>
                    <th className="p-4 font-medium">Status</th>
                    {/* Cabeçalho de ações some na impressão */}
                    <th className="p-4 font-medium text-center print:hidden">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                  {convidados.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition print:break-inside-avoid">
                      <td className="p-4 text-gray-800 font-medium">{c.nome} {c.sobrenome}</td>
                      <td className="p-4 text-sm text-gray-500 print:text-gray-800">
                        <div>{c.email}</div>
                        <div>{c.telefone}</div>
                      </td>
                      <td className="p-4 text-gray-800 font-bold">{c.mesa}</td>
                      <td className="p-4">
                        {c.status ? (
                           <span className="text-green-600 font-bold print:text-black">Presente</span>
                        ) : (
                           <span className="text-orange-500 print:text-black">Pendente</span>
                        )}
                      </td>
                      {/* Botões de ação somem na impressão */}
                      <td className="p-4 flex justify-center gap-2 print:hidden">
                        <button onClick={() => prepararEdicao(c)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"><Pencil size={18} /></button>
                        <button onClick={() => deletarConvidado(c.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}