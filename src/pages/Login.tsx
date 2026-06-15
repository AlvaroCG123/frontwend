import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// 1. Tipagem: Definimos o formato exato dos dados que o formulário vai receber
interface LoginForm {
  email: string;
  senha: string;
}

export function Login() {
  // Passamos a interface LoginForm para o useForm saber quais campos existem
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const navigate = useNavigate();

  // 2. Função de Envio
  const lidarComLogin = async (dados: LoginForm) => {
    try {
      const resposta = await api.post('/usuario/login', dados);
      
      // Salva o token gerado pela API no navegador
      localStorage.setItem('token', resposta.data.token);
      
      // Redireciona com base no cargo que veio do banco de dados
      if (resposta.data.usuario.cargo === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/recepcao');
      }
    } catch (error) {
      alert('Erro ao realizar login. Verifique suas credenciais.');
    }
  };

  // 3. O Visual com Tailwind CSS
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Senac Wedding</h1>
        
        <form onSubmit={handleSubmit(lidarComLogin)} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('email', { required: 'E-mail é obrigatório' })}
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('senha', { required: 'Senha é obrigatória' })}
            />
            {errors.senha && <span className="text-red-500 text-sm">{errors.senha.message}</span>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-2"
          >
            Acessar Sistema
          </button>
        </form>
      </div>
    </main>
  );
}