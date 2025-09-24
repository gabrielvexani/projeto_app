// Importa hooks do React para estado e efeito colateral
import { useEffect, useState } from "react";
// Importa componentes visuais do React Native
import { Alert, Button, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
// Importa utilitário para seleção de imagens
import * as ImagePicker from "expo-image-picker";
// Importa instância do Supabase para autenticação e banco de dados
import { supabase } from "../src/lib/supabase";
// Importa hook de navegação do Expo Router
import { useRouter } from "expo-router";

// Componente principal da página de perfil
export default function Profile() {
  // Estado para armazenar o nome do usuário
  const [nome, setNome] = useState("");
  // Estado para armazenar a descrição do perfil
  const [descricao, setDescricao] = useState("");
  // Estado para armazenar a foto do perfil (URL ou local)
  const [foto, setFoto] = useState<string | null>(null);
  // Estado para armazenar os dados do usuário logado
  const [user, setUser] = useState<any>(null);
  // Hook para navegação entre páginas
  const router = useRouter();

  // Efeito que busca os dados do usuário e do perfil ao carregar a página
  useEffect(() => {
    // Busca usuário logado
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);

        // Busca perfil salvo no banco de dados
        const { data: perfil, error } = await supabase
          .from("profiles")
          .select("nome, descricao, foto")
          .eq("id", data.user.id)
          .single();

        if (!error && perfil) {
          setNome(perfil.nome || ""); // Preenche nome
          setDescricao(perfil.descricao || ""); // Preenche descrição
          setFoto(perfil.foto || null); // Preenche foto
        }
      } else {
        // Se não estiver logado, redireciona para login
        router.replace("/login");
      }
    });
  }, []);

  // Função para escolher uma foto da galeria
  async function escolherFoto() {
    // Solicita permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria!");
      return;
    }

    // Abre a galeria para selecionar imagem
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    // Se o usuário escolheu uma imagem, salva a URI
    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  }

  // Função para salvar/atualizar o perfil do usuário
  async function salvarPerfil() {
    if (!user) return;

    let fotoUrl = foto;

    // Se a foto for nova (uri local), faz upload para o Supabase Storage
    if (foto && foto.startsWith("file://")) {
      try {
        const fileName = `${user.id}.jpg`;

        const formData = new FormData();
        formData.append("file", {
          uri: foto,
          name: fileName,
          type: "image/jpeg",
        } as any);

        // Faz upload da imagem
        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(fileName, formData, { upsert: true });

        if (uploadError) return Alert.alert("Erro", uploadError.message);

        // Obtém a URL pública da imagem
        const { data } = supabase.storage.from("profiles").getPublicUrl(fileName);
        fotoUrl = data.publicUrl;
      } catch (err: any) {
        return Alert.alert("Erro", err.message || "Falha ao enviar a imagem");
      }
    }

    // Salva/atualiza os dados do perfil no banco
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      nome,
      descricao,
      foto: fotoUrl,
    });

    if (error) Alert.alert("Erro", error.message);
    else Alert.alert("Sucesso", "Perfil atualizado!");
  }

  // Função para fazer logout do usuário
  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // Renderiza a interface do perfil
  return (
    <View style={{ flex: 1, alignItems: "center", padding: 20 }}>
      {/* Foto de perfil, clicável para alterar */}
      <TouchableOpacity onPress={escolherFoto}>
        <Image
          source={{
            uri:
              foto ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png", // avatar padrão
          }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: "#ccc",
          }}
        />
        <Text style={{ textAlign: "center", color: "#007AFF" }}>
          Alterar foto
        </Text>
      </TouchableOpacity>

      {/* Campo para editar o nome do perfil */}
      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 8,
          width: "100%",
          borderRadius: 6,
        }}
      />
      {/* Campo para editar a descrição do perfil */}
      <TextInput
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 8,
          width: "100%",
          borderRadius: 6,
        }}
      />

      {/* Botão para salvar as alterações do perfil */}
      <Button title="Salvar" onPress={salvarPerfil} />
      <View style={{ marginTop: 10 }}>
        {/* Botão para sair da conta */}
        <Button title="Sair" onPress={logout} color="red" />
      </View>
    </View>
  );
}
