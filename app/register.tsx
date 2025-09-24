// Importa o hook useState para gerenciar estados locais
import { useState } from "react";
// Importa componentes básicos da interface do React Native
import { Alert, Button, TextInput, View } from "react-native";
// Importa a instância do Supabase para autenticação
import { supabase } from "../src/lib/supabase";
// Importa o hook de navegação do Expo Router
import { useRouter } from "expo-router";

// Componente principal de registro de usuário
export default function Register() {
  // Estado para armazenar o email digitado
  const [email, setEmail] = useState("");
  // Estado para armazenar a senha digitada
  const [password, setPassword] = useState("");
  // Hook para navegação entre páginas
  const router = useRouter();

  // Função responsável por realizar o cadastro
  async function handleRegister() {
    // Tenta cadastrar o usuário com email e senha usando Supabase
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      // Exibe alerta em caso de erro
      Alert.alert("Erro", error.message);
    } else {
      // Exibe mensagem de sucesso e orienta a confirmar o email
      Alert.alert("Sucesso", "Verifique seu email para confirmar a conta!");
      // Redireciona para a página de login
      router.replace("/login");
    }
  }

  // Renderiza a interface de cadastro
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      {/* Campo de texto para o email */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      {/* Campo de texto para a senha */}
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      {/* Botão para realizar cadastro */}
      <Button title="Cadastrar" onPress={handleRegister} />
      {/* Botão para voltar à página de login */}
      <Button title="Voltar ao Login" onPress={() => router.replace("/login")} />
    </View>
  );
}
