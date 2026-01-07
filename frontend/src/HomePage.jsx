import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api/axios';
import Skeleton from './components/Skeleton';

function HomePage() {
    const [problems, setProblems] = useState([])
    const [filteredProblems, setFilteredProblems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterDifficulty, setFilterDifficulty] = useState('All')

    // 1. Dictionarul de traducere
    const difficultyMap = {
        'Easy': 'Ușor',
        'Medium': 'Mediu',
        'Hard': 'Greu'
    };

    useEffect(() => {
        api.get('/problems')
            .then(response => {
                setProblems(response.data)
                setFilteredProblems(response.data)
                setLoading(false)
            })
            .catch(error => {
                console.error('Error fetching problems:', error)
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        let result = problems

        // Filter by Search Term
        if (searchTerm) {
            result = result.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filter by Difficulty
        // Aici pastram 'All' pentru logica interna
        if (filterDifficulty !== 'All') {
            result = result.filter(p => p.difficulty === filterDifficulty)
        }

        setFilteredProblems(result)
    }, [searchTerm, filterDifficulty, problems])

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-700'
            case 'Medium': return 'bg-yellow-100 text-yellow-700'
            case 'Hard': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight text-center">
                Probleme de Exersat
            </h1>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <input
                    type="text"
                    placeholder="Caută probleme..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                />

                <div className="flex gap-2">
                    {/* 2. REPARAT: Folosim valorile in Engleza pentru logica ('All', 'Easy'...) */}
                    {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                        <button
                            key={diff}
                            onClick={() => setFilterDifficulty(diff)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterDifficulty === diff
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {/* 3. Aici traducem DOAR ce vede utilizatorul */}
                            {diff === 'All' ? 'Toate' : difficultyMap[diff]}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-48 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </div>
                            <div className="mt-4">
                                <Skeleton className="h-4 w-16 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProblems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProblems.map(problem => (
                        <Link
                            key={problem.id}
                            to={`/problem/${problem.id}`}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 p-6 block group h-full flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                                    {problem.title}
                                </h3>
                                {problem.is_solved && (
                                    <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-full border border-green-100">
                                        ✅ Rezolvat
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getDifficultyColor(problem.difficulty)}`}>
                                    {/* 4. REPARAT: Traducem dificultatea pe card */}
                                    {difficultyMap[problem.difficulty]}
                                </span>
                                <span className="text-gray-400 text-sm group-hover:text-emerald-500 transition-colors">
                                    {/* 5. REPARAT: View -> Vezi */}
                                    Vezi →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                    <p className="text-xl text-gray-500">Nu am găsit probleme conform criteriilor.</p>
                    <button
                        onClick={() => { setSearchTerm(''); setFilterDifficulty('All'); }}
                        className="mt-4 text-emerald-600 font-medium hover:underline"
                    >
                        Șterge Filtrele
                    </button>
                </div>
            )}
        </div>
    )
}

export default HomePage