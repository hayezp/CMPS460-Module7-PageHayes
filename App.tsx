
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Category = 'Cleaning' | 'Laundry' | 'Kitchen' | 'Other';
type Filter = 'All' | 'Active' | 'Completed';

type HouseholdTask = {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
};

const STORAGE_KEY = 'household_organizer_tasks';
const categories: Category[] = ['Cleaning', 'Laundry', 'Kitchen', 'Other'];
const filters: Filter[] = ['All', 'Active', 'Completed'];

export default function App() {
  const [tasks, setTasks] = useState<HouseholdTask[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [category, setCategory] = useState<Category>('Cleaning');
  const [filter, setFilter] = useState<Filter>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setTasks(JSON.parse(saved));
        }
      } catch (error) {
        Alert.alert('Error', 'Could not load saved tasks.');
      } finally {
        setLoaded(true);
      }
    }

    loadTasks();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    async function saveTasks() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        Alert.alert('Error', 'Could not save tasks.');
      }
    }

    saveTasks();
  }, [tasks, loaded]);

  function addOrUpdateTask() {
    const title = taskInput.trim();

    if (!title) {
      Alert.alert('Missing Task', 'Please enter a household task.');
      return;
    }

    if (editingId !== null) {
      setTasks(current =>
        current.map(task =>
          task.id === editingId
            ? { ...task, title, category }
            : task
        )
      );
      setEditingId(null);
    } else {
      const newTask: HouseholdTask = {
        id: `${Date.now()}-${Math.random()}`,
        title,
        category,
        completed: false,
      };

      setTasks(current => [...current, newTask]);
    }

    setTaskInput('');
    setCategory('Cleaning');
  }

  function editTask(task: HouseholdTask) {
    setTaskInput(task.title);
    setCategory(task.category);
    setEditingId(task.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setTaskInput('');
    setCategory('Cleaning');
  }

  function toggleTask(id: string) {
    setTasks(current =>
      current.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(id: string) {
    setTasks(current => current.filter(task => task.id !== id));

    if (editingId === id) {
      cancelEdit();
    }
  }

  const visibleTasks = tasks.filter(task => {
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleTasks}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Household Task Organizer</Text>
            <Text style={styles.subtitle}>
              Keep track of chores around the house
            </Text>

            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                Total Tasks: {tasks.length}
              </Text>
              <Text style={styles.summaryText}>
                Completed: {completedCount}
              </Text>
            </View>

            <Text style={styles.label}>Household Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: Wash dishes"
              value={taskInput}
              onChangeText={setTaskInput}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.optionScroll}
            >
              {categories.map(item => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.option,
                    category === item && styles.selectedOption,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      category === item && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={styles.addButton} onPress={addOrUpdateTask}>
              <Text style={styles.addButtonText}>
                {editingId ? 'Save Changes' : 'Add Task'}
              </Text>
            </Pressable>

            {editingId !== null && (
              <Pressable onPress={cancelEdit} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel Editing</Text>
              </Pressable>
            )}

            <Text style={styles.sectionHeading}>My Household Tasks</Text>

            <View style={styles.filterRow}>
              {filters.map(item => (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterButton,
                    filter === item && styles.selectedFilter,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === item && styles.selectedFilterText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No tasks to show. Add a household task to get started!
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Pressable
              onPress={() => toggleTask(item.id)}
              style={styles.taskDetails}
            >
              <Text
                style={[
                  styles.taskTitle,
                  item.completed && styles.completedTask,
                ]}
              >
                {item.completed ? '✓ ' : '○ '}
                {item.title}
              </Text>
              <Text style={styles.categoryText}>
                {item.category} • {item.completed ? 'Completed' : 'Active'}
              </Text>
            </Pressable>

            <View style={styles.actions}>
              <Pressable
                onPress={() => editTask(item)}
                style={styles.editButton}
              >
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>

              <Pressable
                onPress={() => deleteTask(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.actionText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f5f7',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#263747',
  },
  subtitle: {
    fontSize: 14,
    color: '#667788',
    marginTop: 6,
    marginBottom: 20,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#dfeaf3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 22,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#263747',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#263747',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5df',
    borderRadius: 8,
    padding: 13,
    fontSize: 16,
    marginBottom: 18,
  },
  optionScroll: {
    marginBottom: 18,
  },
  option: {
    borderWidth: 1,
    borderColor: '#8ca4b8',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'white',
  },
  selectedOption: {
    backgroundColor: '#315d80',
    borderColor: '#315d80',
  },
  optionText: {
    color: '#315d80',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#315d80',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelText: {
    color: '#315d80',
  },
  sectionHeading: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#263747',
    marginTop: 28,
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e0e5ea',
    marginRight: 8,
  },
  selectedFilter: {
    backgroundColor: '#315d80',
  },
  filterText: {
    color: '#34495e',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: 'white',
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e7eb',
  },
  taskDetails: {
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#263747',
  },
  completedTask: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  categoryText: {
    fontSize: 13,
    color: '#667788',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#477a9d',
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 7,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#c74646',
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 7,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#667788',
    marginTop: 25,
    fontSize: 15,
  },
});
