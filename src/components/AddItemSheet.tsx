import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { DelayPreset } from '../types/items';

type AddItemSheetProps = {
  onClose: () => void;
  onSubmit: (input: {
    delayPreset: DelayPreset;
    name: string;
    note: string;
    priceInput: string;
  }) => Promise<void>;
  submitting: boolean;
};

const delayPresets: DelayPreset[] = ['12h', '24h', '48h', '7d'];

export function AddItemSheet({
  onClose,
  onSubmit,
  submitting,
}: AddItemSheetProps) {
  const [delayPreset, setDelayPreset] = useState<DelayPreset>('24h');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMessage('Item name is required.');
      return;
    }

    setErrorMessage('');
    await onSubmit({
      delayPreset,
      name,
      note,
      priceInput,
    });
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.eyebrow}>Add item</Text>
        <Text style={styles.title}>Pause before the purchase.</Text>
        <Text style={styles.subtitle}>
          Save the impulse quickly, then let time do the work.
        </Text>

        <TextInput
          autoFocus
          onChangeText={setName}
          placeholder="Item name"
          placeholderTextColor="#8c8578"
          returnKeyType="next"
          style={styles.input}
          value={name}
        />
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setPriceInput}
          placeholder="Price"
          placeholderTextColor="#8c8578"
          style={styles.input}
          value={priceInput}
        />
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="Why do you want it?"
          placeholderTextColor="#8c8578"
          style={[styles.input, styles.noteInput]}
          value={note}
        />

        <View style={styles.presetRow}>
          {delayPresets.map(preset => {
            const selected = preset === delayPreset;

            return (
              <Pressable
                key={preset}
                onPress={() => setDelayPreset(preset)}
                style={[styles.presetChip, selected && styles.presetChipSelected]}>
                <Text
                  style={[
                    styles.presetLabel,
                    selected && styles.presetLabelSelected,
                  ]}>
                  {preset}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={handleSubmit}
          style={[styles.cta, submitting && styles.ctaDisabled]}>
          {submitting ? (
            <ActivityIndicator color="#fffef9" size="small" />
          ) : (
            <Text style={styles.ctaLabel}>Add &amp; Wait</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 24, 18, 0.28)',
  },
  cta: {
    alignItems: 'center',
    backgroundColor: '#1f7a5a',
    borderRadius: 24,
    paddingVertical: 18,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaLabel: {
    color: '#fffef9',
    fontSize: 17,
    fontWeight: '700',
  },
  errorText: {
    color: '#a83f34',
    fontSize: 14,
    marginBottom: 14,
  },
  eyebrow: {
    color: '#857e73',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#d8cfbf',
    borderRadius: 999,
    height: 6,
    marginBottom: 18,
    width: 54,
  },
  input: {
    backgroundColor: '#f5efe4',
    borderColor: '#e5ddcf',
    borderRadius: 18,
    borderWidth: 1,
    color: '#38342f',
    fontSize: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  noteInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  presetChip: {
    backgroundColor: '#efe7d7',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  presetChipSelected: {
    backgroundColor: '#1f7a5a',
  },
  presetLabel: {
    color: '#524c43',
    fontSize: 14,
    fontWeight: '600',
  },
  presetLabelSelected: {
    color: '#fffef9',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  sheet: {
    backgroundColor: '#fffaf2',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  subtitle: {
    color: '#70695f',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  title: {
    color: '#1f1b16',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 12,
  },
});
