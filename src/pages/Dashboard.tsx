import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../services/api';
import { Users, CheckCircle, Clock, Trash2 } from 'lucide-react';

// 1. Tipagens
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

// Os dados exatos que a tua API pede para criar um convidado
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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormConvidado>();

  // 2. Carregar Convidados
  const carregarConvidados = async () => {
    try {
      const resposta = await api.get('/convidado/listar');
      setConvidados(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar convidados", error);
    }
  };

  useEffect(() => {
    carregarConvidados();
  }, []);

  // 3. Criar Convidado (Usando o teu conhecimento de react-hook-form!)
  const lidarComEnvio = async (dados: FormConvidado) => {
    try {
      // O Prisma espera a mesa como número, então garantimos a conversão
      dados.mesa = Number(dados.mesa);
      dados.status = false; // Novo convidado começa sempre com check-in falso
      
      await api.post('/convidado/criar', dados);
      alert("Convidado registado com sucesso!");
      reset(); // Limpa o formulário
      carregarConvidados(); // Atualiza a tabela e os gráficos
    } catch (error) {
      alert("Erro ao registar. Verifica se o CPF ou E-mail já existem.");
    }
  };

  // 4. Deletar Convidado
  const deletarConvidado = async (id: number) => {
    const confirmar = window.confirm("Tens a certeza que desejas excluir este convidado?");
    if (!confirmar) return;

    try {
      await api.delete(`/convidado/deletar/${id}`); // Adaptado para passar o ID como parâmetro
      carregarConvidados();
    } catch (error) {
      alert("Erro ao excluir convidado.");
    }
  };

  // --- CÁLCULOS DO DASHBOARD ---
  const totalConvidados = convidados.length;
  const confirmados = convidados.filter(c => c.status).length;
  const pendentes = totalConvidados - confirmados;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Painel de Gestão</h1>
          <p className="text-gray-500">Senac Wedding - Visão Administrativa</p>
        </header>

        {/* SECÇÃO 1: CARDS DO DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Convidados</p>
              <p className="text-2xl font-bold text-gray-800">{totalConvidados}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Confirmados (Check-in)</p>
              <p className="text-2xl font-bold text-gray-800">{confirmados}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-orange-100 p-4 rounded-full text-orange-600">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-gray-800">{pendentes}</p>
            </div>
          </div>
        </div>

        {/* SECÇÃO 2: FORMULÁRIO E LISTA LADO A LADO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulário de Criação */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Adicionar Convidado</h2>
            <form onSubmit={handleSubmit(lidarComEnvio)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input type="text" placeholder="Nome" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('nome', { required: true })} />
                </div>
                <div>
                  <input type="text" placeholder="Sobrenome" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('sobrenome', { required: true })} />
                </div>
              </div>
              
              <input type="text" placeholder="CPF" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('cpf', { required: true })} />
              
              <input type="email" placeholder="E-mail" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('email', { required: true })} />
              
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Telefone" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('telefone', { required: true })} />
                <input type="number" placeholder="Nº Mesa" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" {...register('mesa', { required: true, min: 1 })} />
              </div>

              <button type="submit" className="w-full bg-gray-800 text-white font-bold py-2 rounded hover:bg-gray-700 transition mt-2">
                Registar
              </button>
            </form>
          </div>

          {/* Tabela de Gestão */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Lista Geral</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Nome Completo</th>
                    <th className="p-4 font-medium">Contactos</th>
                    <th className="p-4 font-medium">Mesa</th>
                    <th className="p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {convidados.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-800 font-medium">{c.nome} {c.sobrenome}</td>
                      <td className="p-4 text-sm text-gray-500">
                        <div>{c.email}</div>
                        <div>{c.telefone}</div>
                      </td>
                      <td className="p-4 text-gray-800">{c.mesa}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => deletarConvidado(c.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {convidados.length === 0 && (
                <p className="p-6 text-center text-gray-500">Sem registos de convidados.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}