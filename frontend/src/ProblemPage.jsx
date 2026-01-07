import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import api from './api/axios';

const PYTHON_KEYWORDS = [
    'def', 'class', 'import', 'return', 'if', 'else', 'while', 'for',
    'print', 'input', 'len', 'range', 'int', 'str', 'sum', 'max', 'min', 'sorted', 'list', 'dict', 'set'
];

function ProblemPage() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('print("Hello World")');
    const [customInput, setCustomInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // UI State for visual feedback
    const [isProcessing, setIsProcessing] = useState(false);

    // INSTANT LOCK (Ref updates are synchronous)
    const processingRef = useRef(false);

    const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(true);
    const autocompleteRef = useRef(isAutocompleteEnabled);

    // --- 1. Dictionarul de traducere ---
    const difficultyMap = {
        'Easy': 'Ușor',
        'Medium': 'Mediu',
        'Hard': 'Greu'
    };

    useEffect(() => {
        autocompleteRef.current = isAutocompleteEnabled;
    }, [isAutocompleteEnabled]);

    function handleEditorDidMount(editor, monaco) {
        monaco.languages.registerCompletionItemProvider('python', {
            provideCompletionItems: (model, position) => {
                if (!autocompleteRef.current) {
                    return { suggestions: [] };
                }
                const suggestions = PYTHON_KEYWORDS.map(key => ({
                    label: key,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: key
                }));
                return { suggestions: suggestions };
            }
        });
    }

    useEffect(() => {
        api.get(`/problems/${id}`)
            .then(response => {
                setProblem(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching problem:', error);
                setLoading(false);
                toast.error('Failed to load problem');
            });
    }, [id]);

    const handleRun = async () => {
        if (processingRef.current) return;

        processingRef.current = true;
        setIsProcessing(true);
        const startTime = Date.now();

        setOutput('');
        setError('');
        toast.dismiss();
        const toastId = toast.loading('Se execută...'); // <-- TRADUS

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Trebuie să fii logat pentru a rula cod!', { id: toastId }); // <-- TRADUS
                return;
            }

            const response = await api.post('/run', {
                code: code,
                input_data: customInput
            });

            const data = response.data;

            if (data.error) {
                toast.error('Eroare de Execuție', { id: toastId }); // <-- TRADUS
                setError(data.error);
            } else {
                toast.success('Cod executat!', { id: toastId }); // <-- TRADUS
                setOutput(data.output);
            }

        } catch (err) {
            console.error('Run error:', err);
            if (err.response && err.response.status === 401) {
                toast.error('Sesiune expirată', { id: toastId });
            } else {
                toast.error('Eroare la execuție', { id: toastId });
            }
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 500 - elapsedTime;
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            processingRef.current = false;
            setIsProcessing(false);
        }
    };

    const handleSubmit = async () => {
        if (processingRef.current) return;

        processingRef.current = true;
        setIsProcessing(true);
        const startTime = Date.now();

        setOutput('');
        setError('');
        toast.dismiss();
        const toastId = toast.loading('Se trimite soluția...'); // <-- TRADUS

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Trebuie să fii logat pentru a trimite!', { id: toastId });
                return;
            }

            const response = await api.post(`/submit`, {
                code: code,
                problem_id: parseInt(id)
            });

            const data = response.data;

            if (data.status === 'Accepted') {
                toast.success('✅ Admis! Felicitări!', { id: toastId, duration: 4000 }); // <-- TRADUS
                setOutput('Admis\nToate testele au trecut cu succes!'); // <-- TRADUS
            } else if (data.status === 'Wrong Answer') {
                toast.error('❌ Răspuns Greșit', { id: toastId }); // <-- TRADUS
                setError(`${data.details}`);
            } else if (data.status === 'Runtime Error') {
                toast.error('⚠️ Eroare la Rulare', { id: toastId }); // <-- TRADUS
                setError(data.details);
            } else {
                toast.error('Trimitere Eșuată', { id: toastId }); // <-- TRADUS
                setError(JSON.stringify(data));
            }

        } catch (err) {
            console.error('Submit error:', err);
            if (err.response && err.response.status === 401) {
                toast.error('Sesiune expirată', { id: toastId });
            } else {
                toast.error('Nu s-a putut trimite soluția', { id: toastId });
            }
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 500 - elapsedTime;
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            processingRef.current = false;
            setIsProcessing(false);
        }
    };

    const navigate = useNavigate();
    const userEmail = localStorage.getItem('email');
    const isAdmin = userEmail === import.meta.env.VITE_SUPER_ADMIN_EMAIL;// TODO: Update based on API check ideally

    const handleDelete = async () => {
        if (window.confirm('Sigur vrei să ștergi această problemă?')) { // <-- TRADUS
            try {
                await api.delete(`/problems/${id}`);
                toast.success('Problemă ștearsă');
                navigate('/');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Nu s-a putut șterge problema');
            }
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-700';
            case 'Medium': return 'bg-yellow-100 text-yellow-700';
            case 'Hard': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Se încarcă...</div>;
    if (!problem) return <div className="text-center py-20 text-red-500">Problema nu a fost găsită</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
            <div className="flex flex-col gap-6">
                {/* 1. Header Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{problem.title}</h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                                    {/* 2. TRADUCERE DIFICULTATE */}
                                    {difficultyMap[problem.difficulty]}
                                </span>
                                {problem.tags && problem.tags.map(tag => (
                                    <span key={tag.id} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-medium border border-slate-200">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/edit-problem/${id}`)}
                                    className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                >
                                    Editează
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                >
                                    Șterge
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
                        <p className="whitespace-pre-wrap">{problem.description}</p>
                    </div>

                    {problem.hint && (
                        <div className="mt-8">
                            <details className="group bg-amber-50 border border-amber-200 rounded-lg overflow-hidden transition-all duration-300">
                                <summary className="flex items-center justify-between p-4 cursor-pointer select-none text-amber-800 font-medium hover:bg-amber-100 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        {/* 3. TRADUCERE HINT */}
                                        <span>Arată Indiciu 💡</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 transform group-open:rotate-180 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </summary>
                                <div className="p-4 pt-0 text-amber-900 text-sm whitespace-pre-wrap border-t border-amber-200/50">
                                    {problem.hint}
                                </div>
                            </details>
                        </div>
                    )}
                </div>

                {/* 2. Editor & Output Section */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center cursor-pointer space-x-2">
                            <input
                                type="checkbox"
                                checked={isAutocompleteEnabled}
                                onChange={(e) => setIsAutocompleteEnabled(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 transition duration-150 ease-in-out"
                            />
                            {/* 4. TRADUCERE AUTOCOMPLETE */}
                            <span className="text-sm font-medium text-gray-700">Activează Completarea Automată</span>
                        </label>
                    </div>

                    <div className="flex-grow rounded-2xl overflow-hidden shadow-sm border border-gray-200 h-[60vh]">
                        <Editor
                            onMount={handleEditorDidMount}
                            height="100%"
                            defaultLanguage="python"
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 16,
                                quickSuggestions: isAutocompleteEnabled,
                                suggestOnTriggerCharacters: isAutocompleteEnabled,
                                parameterHints: { enabled: true },
                                wordBasedSuggestions: false,
                                padding: { top: 16 }
                            }}
                        />
                    </div>

                    <div className="mt-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        {/* Custom Input Section */}
                        <div className="mb-4">
                            {/* 5. TRADUCERE INPUT */}
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de Intrare (pentru testare manuală)
                            </label>
                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Introdu datele de intrare aici (ex. pentru funcția input())..."
                                className="w-full p-2 bg-slate-900 text-white font-mono rounded-md border border-slate-700 h-24 resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-4" style={{ pointerEvents: isProcessing ? 'none' : 'auto' }}>
                            <button
                                onClick={handleRun}
                                disabled={isProcessing || loading}
                                className={`flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 ${isProcessing || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {/* 6. TRADUCERE BUTON RUN */}
                                {isProcessing ? 'Se execută...' : 'Rulează Cod'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing || loading}
                                className={`flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20 ${isProcessing || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {/* 7. TRADUCERE BUTON SUBMIT */}
                                {isProcessing ? 'Se trimite...' : 'Trimite Soluția'}
                            </button>
                        </div>

                        {/* ... Output Section ... */}
                        {(output || error) && (
                            <div className="mt-6 animate-fade-in">
                                <div className="bg-slate-900 rounded-lg overflow-hidden">
                                    <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 text-gray-400 text-xs font-mono uppercase tracking-wider">
                                        {/* 8. TRADUCERE OUTPUT HEADER */}
                                        Rezultat
                                    </div>
                                    <div className="p-4 font-mono text-sm overflow-x-auto">
                                        {output && <pre className="text-emerald-400 whitespace-pre-wrap">{output}</pre>}
                                        {error && <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemPage;