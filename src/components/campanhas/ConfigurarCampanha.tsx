import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from "react-native";
import { useCampanha } from "../../contexts/CampanhaContext";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";

// Opções de gêneros musicais
const genreOptions = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Eletrônica",
  "Sertanejo",
  "Funk",
  "Pagode",
  "MPB",
  "Jazz",
  "Metal",
  "Indie",
  "K-pop",
  "Reggae",
  "Clássica",
];

// Opções de idiomas
const languageOptions = [
  "Português",
  "Inglês",
  "Espanhol",
  "Francês",
  "Alemão",
  "Italiano",
  "Japonês",
  "Coreano",
  "Mandarim",
];

// Opções de mood/clima sugeridas
const moodOptions = [
  "Energético",
  "Relaxante",
  "Romântico",
  "Motivacional",
  "Melancólico",
  "Feliz",
  "Nostálgico",
  "Festivo",
  "Concentração",
];

// Constantes para o layout dos itens da FlatList
const ITEM_HEIGHT = 40; // Altura de cada chip
const ITEM_MARGIN = 8; // Margem horizontal

interface SelectorProps {
  label: string;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
}

/**
 * Componente para seleção de opções usando FlatList horizontal otimizada
 */
const OptionSelector: React.FC<SelectorProps> = ({
  label,
  options,
  selectedOption,
  onSelect,
}) => {
  // Função de renderização memoizada para evitar re-renders desnecessários
  const renderOption = React.useCallback(
    ({ item }: ListRenderItemInfo<string>) => (
      <TouchableOpacity
        style={[
          styles.optionButton,
          selectedOption === item && styles.optionButtonSelected,
        ]}
        onPress={() => onSelect(item)}
      >
        <Text
          style={[
            styles.optionText,
            selectedOption === item && styles.optionTextSelected,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    ),
    [selectedOption, onSelect]
  );

  // Função getItemLayout para otimizar renderização da FlatList
  const getItemLayout = React.useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Extrator de chaves memoizado
  const keyExtractor = React.useCallback((item: string) => item, []);

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <FlatList
        data={options}
        renderItem={renderOption}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

/**
 * Componente para gerenciar moods personalizados
 */
interface CustomMoodSelectorProps {
  selectedMoods: string[];
  onAddMood: (mood: string) => void;
  onRemoveMood: (mood: string) => void;
}

const CustomMoodSelector: React.FC<CustomMoodSelectorProps> = ({
  selectedMoods,
  onAddMood,
  onRemoveMood,
}) => {
  const [newMood, setNewMood] = React.useState("");

  // Adicionar mood ao pressionar o botão
  const handleAddMood = () => {
    if (newMood.trim() !== "") {
      onAddMood(newMood.trim());
      setNewMood(""); // Limpar campo após adicionar
    }
  };

  // Renderizar chip para cada mood selecionado
  const renderMoodChip = ({ item }: ListRenderItemInfo<string>) => (
    <View style={styles.moodChip}>
      <Text style={styles.moodChipText}>{item}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemoveMood(item)}
      >
        <Ionicons name="close-outline" size={16} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Mood</Text>

      {/* Input para adicionar novo mood */}
      <View style={styles.addMoodContainer}>
        <TextInput
          style={styles.addMoodInput}
          value={newMood}
          onChangeText={setNewMood}
          placeholder="Digite um mood personalizado..."
          placeholderTextColor={colors.ui.placeholder}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMood}
          disabled={newMood.trim() === ""}
        >
          <Ionicons name="add" size={24} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      {/* Sugestões de mood */}
      <Text style={styles.suggestionsLabel}>Sugestões:</Text>
      <FlatList
        data={moodOptions}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionChip}
            onPress={() => onAddMood(item)}
          >
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Moods selecionados */}
      {selectedMoods.length > 0 && (
        <View style={styles.selectedMoodsContainer}>
          <Text style={styles.selectedMoodsLabel}>Moods selecionados:</Text>
          <FlatList
            data={selectedMoods}
            renderItem={renderMoodChip}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      )}
    </View>
  );
};

/**
 * Componente para configuração da campanha
 */
const ConfigurarCampanha: React.FC = () => {
  const { state, setTargetOptions, setObservation } = useCampanha();
  const { targetOptions, observation } = state;

  // Função para atualizar o gênero - memoizada
  const handleSelectGenre = React.useCallback(
    (genre: string) => {
      setTargetOptions({ genre });
    },
    [setTargetOptions]
  );

  // Função para atualizar o idioma - memoizada
  const handleSelectLanguage = React.useCallback(
    (language: string) => {
      setTargetOptions({ language });
    },
    [setTargetOptions]
  );

  // Função para adicionar um mood
  const handleAddMood = React.useCallback(
    (mood: string) => {
      // Verifica se o mood já existe na lista
      if (!targetOptions.mood?.includes(mood)) {
        const updatedMoods = [...(targetOptions.mood || []), mood];
        setTargetOptions({ mood: updatedMoods });
      }
    },
    [targetOptions.mood, setTargetOptions]
  );

  // Função para remover um mood
  const handleRemoveMood = React.useCallback(
    (mood: string) => {
      const updatedMoods = targetOptions.mood?.filter((m) => m !== mood) || [];
      setTargetOptions({ mood: updatedMoods });
    },
    [targetOptions.mood, setTargetOptions]
  );

  // Função para atualizar a observação
  const handleObservationChange = React.useCallback(
    (text: string) => {
      setObservation(text);
    },
    [setObservation]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Configure sua Campanha</Text>
      <Text style={styles.subtitle}>
        Personalize seu público-alvo para obter melhores resultados
      </Text>

      {/* Seletor de gênero musical */}
      <OptionSelector
        label="Gênero Musical"
        options={genreOptions}
        selectedOption={targetOptions.genre || ""}
        onSelect={handleSelectGenre}
      />

      {/* Seletor de idioma */}
      <OptionSelector
        label="Idioma"
        options={languageOptions}
        selectedOption={targetOptions.language || ""}
        onSelect={handleSelectLanguage}
      />

      {/* Seletor de moods personalizado */}
      <CustomMoodSelector
        selectedMoods={targetOptions.mood || []}
        onAddMood={handleAddMood}
        onRemoveMood={handleRemoveMood}
      />

      {/* Campo de observação */}
      <View style={styles.observationContainer}>
        <Text style={styles.selectorLabel}>Observações (opcional)</Text>
        <TextInput
          style={styles.observationInput}
          placeholder="Informações adicionais sobre a campanha..."
          placeholderTextColor={colors.ui.placeholder}
          multiline={true}
          numberOfLines={4}
          value={observation}
          onChangeText={handleObservationChange}
        />
      </View>

      {/* Card de dicas */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons
            name="bulb-outline"
            size={20}
            color={colors.status.info.main}
          />
          <Text style={styles.tipsTitle}>Dicas para melhores resultados</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={colors.status.success.main}
          />
          <Text style={styles.tipText}>
            Escolha o gênero que melhor se encaixa com sua música
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={colors.status.success.main}
          />
          <Text style={styles.tipText}>
            Selecione o idioma correto da letra da música
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={colors.status.success.main}
          />
          <Text style={styles.tipText}>
            Adicione moods personalizados para encontrar o público que busca
            esse clima musical
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 12,
  },
  flatListContent: {
    paddingVertical: 4,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.background.subtle,
    marginRight: 8,
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary.main + "30",
    borderColor: colors.primary.main,
  },
  optionText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  optionTextSelected: {
    color: colors.primary.main,
    fontWeight: "bold",
  },
  observationContainer: {
    marginBottom: 24,
  },
  observationInput: {
    backgroundColor: colors.background.inputField,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: 12,
    color: colors.text.primary,
    textAlignVertical: "top",
    minHeight: 100,
  },
  tipsCard: {
    backgroundColor: colors.status.info.dark + "20",
    borderRadius: 12,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipsTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.status.info.main,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 4,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  addMoodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  addMoodInput: {
    flex: 1,
    backgroundColor: colors.background.inputField,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: 10,
    color: colors.text.primary,
    marginRight: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: colors.background.subtle,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  suggestionsLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.background.subtle,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  selectedMoodsContainer: {
    marginTop: 16,
  },
  selectedMoodsLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.primary.main + "30",
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  moodChipText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: "bold",
    marginRight: 6,
  },
  removeButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: colors.background.subtle,
  },
});

export default ConfigurarCampanha;
