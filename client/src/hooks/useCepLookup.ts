import { useState, useCallback } from "react";

interface CepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface CepLookupState {
  loading: boolean;
  error: string | null;
  data: CepResult | null;
}

export function useCepLookup() {
  const [state, setState] = useState<CepLookupState>({
    loading: false,
    error: null,
    data: null,
  });

  const lookup = useCallback(async (cep: string): Promise<CepResult | null> => {
    const digits = cep.replace(/\D/g, "");
    
    if (digits.length !== 8) {
      setState({ loading: false, error: "CEP deve ter 8 dígitos", data: null });
      return null;
    }

    setState({ loading: true, error: null, data: null });

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      
      if (!response.ok) {
        setState({ loading: false, error: "Erro ao consultar CEP", data: null });
        return null;
      }

      const data: CepResult = await response.json();

      if (data.erro) {
        setState({ loading: false, error: "CEP não encontrado", data: null });
        return null;
      }

      setState({ loading: false, error: null, data });
      return data;
    } catch {
      setState({ loading: false, error: "Erro de conexão ao consultar CEP", data: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return { ...state, lookup, reset };
}
