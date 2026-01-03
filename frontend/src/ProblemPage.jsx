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
        // 1. INSTANT GUARD
        if (processingRef.current) return;

        // 2. LOCK
        processingRef.current = true;
        setIsProcessing(true);
        const startTime = Date.now(); // Start timer

        // 3. CLEANUP UI
        setOutput('');
        setError('');
        toast.dismiss(); // Clear previous toasts
        const toastId = toast.loading('Running code...');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You must be logged in to run code!', { id: toastId });
                return;
            }

            // 4. EXECUTE (Natural Await)
            const response = await api.post('/run', {
                code: code,
                input_data: customInput
            });

            const data = response.data;

            if (data.error) {
                toast.error('Execution Error', { id: toastId });
                setError(data.error);
            } else {
                toast.success('Code executed!', { id: toastId });
                setOutput(data.output);
            }

        } catch (err) {
            console.error('Run error:', err);
            if (err.response && err.response.status === 401) {
                toast.error('Session expired', { id: toastId });
            } else {
                toast.error('Failed to execute code', { id: toastId });
            }
        } finally {
            // 5. GUARANTEED DELAY (The "Finally" Trap)
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 500 - elapsedTime;
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            // 6. UNLOCK
            processingRef.current = false;
            setIsProcessing(false);
        }
    };

    const handleSubmit = async () => {
        // 1. INSTANT GUARD
        if (processingRef.current) return;

        // 2. LOCK
        processingRef.current = true;
        setIsProcessing(true);
        const startTime = Date.now(); // Start timer

        // 3. CLEANUP UI
        setOutput('');
        setError('');
        toast.dismiss();
        const toastId = toast.loading('Submitting solution...');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You must be logged in to submit!', { id: toastId });
                return;
            }

            // 4. EXECUTE (Natural Await)
            const response = await api.post(`/submit`, {
                code: code,
                problem_id: parseInt(id)
            });

            const data = response.data;

            if (data.status === 'Accepted') {
                toast.success('✅ Accepted! Great job!', { id: toastId, duration: 4000 });
                setOutput('Accepted\nAll test cases passed!');
            } else if (data.status === 'Wrong Answer') {
                toast.error('❌ Wrong Answer', { id: toastId });
                setError(`${data.details}`);
            } else if (data.status === 'Runtime Error') {
                toast.error('⚠️ Runtime Error', { id: toastId });
                setError(data.details);
            } else {
                toast.error('Submission Failed', { id: toastId });
                setError(JSON.stringify(data));
            }

        } catch (err) {
            console.error('Submit error:', err);
            if (err.response && err.response.status === 401) {
                toast.error('Session expired', { id: toastId });
            } else {
                toast.error('Failed to submit code', { id: toastId });
            }
        } finally {
            // 5. GUARANTEED DELAY (The "Finally" Trap)
            const elapsedTime = Date.now() - startTime;
            const remainingTime = 500 - elapsedTime;
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            // 6. UNLOCK
            processingRef.current = false;
            setIsProcessing(false);
        }
    };

    const navigate = useNavigate();
    const userEmail = localStorage.getItem('email');
    // Admin check hardcoded temporarily for safety/testing
    const isAdmin = userEmail === 'denis@student.upt.ro';

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                await api.delete(`/problems/${id}`);
                toast.success('Problem deleted');
                navigate('/');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete problem');
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

    if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
    if (!problem) return <div className="text-center py-20 text-red-500">Problem not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Left Column: Description */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-y-auto lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-slate-900">{problem.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                        </span>
                    </div>

                    {isAdmin && (
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => navigate(`/edit-problem/${id}`)}
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm font-medium transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    )}

                    <div className="prose prose-slate text-gray-700 leading-relaxed mt-6">
                        <p className="whitespace-pre-wrap">{problem.description}</p>
                    </div>
                </div>

                {/* Right Column: Editor & Output */}
                <div className="flex flex-col h-full lg:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center cursor-pointer space-x-2">
                            <input
                                type="checkbox"
                                checked={isAutocompleteEnabled}
                                onChange={(e) => setIsAutocompleteEnabled(e.target.checked)}
                                className="form-checkbox h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 transition duration-150 ease-in-out"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable Autocomplete</span>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Input (for testing)
                            </label>
                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Enter input data here (e.g. for input() calls)"
                                className="w-full p-2 bg-slate-900 text-white font-mono rounded-md border border-slate-700 h-24 resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-4" style={{ pointerEvents: isProcessing ? 'none' : 'auto' }}>
                            <button
                                onClick={handleRun}
                                disabled={isProcessing || loading}
                                className={`flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 ${isProcessing || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isProcessing ? 'Running...' : 'Run Code'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing || loading}
                                className={`flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/20 ${isProcessing || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isProcessing ? 'Submitting...' : 'Submit Solution'}
                            </button>
                        </div>

                        {/* ... Output Section ... */}
                        {(output || error) && (
                            <div className="mt-6 animate-fade-in">
                                <div className="bg-slate-900 rounded-lg overflow-hidden">
                                    <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 text-gray-400 text-xs font-mono uppercase tracking-wider">
                                        Output
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