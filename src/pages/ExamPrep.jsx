import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StudyMaterial } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Loader2, Sparkles, BookOpenCheck, Search, ChevronDown, ChevronUp, AlertCircle, Library } from 'lucide-react';
import { supabase } from '@/api/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callAI(prompt) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || SUPABASE_ANON_KEY;
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error(`AI service error: ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.text || '';
}

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  }
  if (name.endsWith('.pdf')) {
    return new Promise(async (resolve) => {
      try {
        if (!window.pdfjsLib) {
          await new Promise((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = res; script.onerror = rej;
            document.head.appendChild(script);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        resolve(fullText);
      } catch (err) { resolve(''); }
    });
  }
  if (name.endsWith('.docx')) {
    return new Promise(async (resolve) => {
      try {
        if (!window.mammoth) {
          await new Promise((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
            script.onload = res; script.onerror = rej;
            document.head.appendChild(script);
          });
        }
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        resolve(result.value || '');
      } catch (err) { resolve(''); }
    });
  }
  return '';
}

function AnswerBlock({ qa, index }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
            {index + 1}
          </span>
          <p className="font-medium text-foreground">{qa.question}</p>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/40">
          <div className="pt-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {qa.answer}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamPrep() {
  const { currentUser } = useAuth();
  const email = currentUser?.email;

  const { data: materials = [] } = useQuery({
    queryKey: ['materials', email],
    queryFn: () => StudyMaterial.filter({}, '-created_at', 100),
    enabled: !!email,
  });

  const [mode, setMode] = useState('library');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  const [qaList, setQaList] = useState([]);
  const [extractedContent, setExtractedContent] = useState('');

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
  const getContext = () => selectedMaterial?.content || extractedContent || content;

  const handleAsk = async () => {
    if (!question.trim()) { setError('Please enter a question!'); return; }
    const ctx = getContext();
    if (!ctx || ctx.trim().length < 20) { setError('Please provide some study content first!'); return; }
    setLoading(true); setStage('Thinking...'); setError('');
    try {
      const prompt = `You are an expert exam tutor. Answer this student question in detail.

STUDY MATERIAL:
"""
${ctx.slice(0, 15000)}
"""

QUESTION: ${question}

Give a comprehensive, well-structured answer with examples where helpful.`;
      setStage('Generating detailed answer...');
      const answer = await callAI(prompt);
      if (!answer) throw new Error('No response from AI. Please try again.');
      setQaList(prev => [{ question, answer }, ...prev]);
      setQuestion('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); setStage('');
    }
  };

  const handleAnalyzeAll = async () => {
    const ctx = getContext();
    if (!ctx || ctx.trim().length < 20) { setError('Please provide some study content first!'); return; }
    setLoading(true); setStage('Analyzing content...'); setError('');
    try {
      const prompt = `You are an expert exam tutor. Generate 8 important exam questions with detailed answers from this study material.

STUDY MATERIAL:
"""
${ctx.slice(0, 15000)}
"""

Return ONLY a JSON array like this (no markdown, no extra text):
[{"question": "Question here?", "answer": "Detailed answer here"}, ...]`;
      setStage('Generating exam Q&As...');
      const response = await callAI(prompt);
      if (!response) throw new Error('No response from AI. Please try again.');
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) throw new Error('Invalid response format');
      setQaList(parsed);
    } catch (err) {
      setError(err.message.includes('JSON') ? 'AI response was invalid. Please try again.' : err.message);
    } finally {
      setLoading(false); setStage('');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">EXAM PREPARATION</div>
        <h1 className="font-serif text-4xl font-semibold">Exam Prep</h1>
        <p className="text-muted-foreground mt-2">
          Upload your study material and get detailed AI-powered answers instantly.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-5">
        <Tabs value={mode} onValueChange={(v) => { setMode(v); setError(''); setSelectedMaterialId(''); }}>
          <TabsList>
            <TabsTrigger value="library"><Library className="w-4 h-4 mr-1.5" />From Library</TabsTrigger>
            <TabsTrigger value="text"><FileText className="w-4 h-4 mr-1.5" />Paste Text</TabsTrigger>
            <TabsTrigger value="file"><Upload className="w-4 h-4 mr-1.5" />Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            {materials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                No materials in your library yet. Upload one first.
              </div>
            ) : (
              <Select value={selectedMaterialId} onValueChange={(v) => { setSelectedMaterialId(v); setError(''); }}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Choose a material from your library..." />
                </SelectTrigger>
                <SelectContent>
                  {materials.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{m.title}</span>
                        {m.subject && <span className="text-xs text-muted-foreground">{m.subject}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedMaterial && (
              <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm text-muted-foreground">
                ✓ <span className="font-medium text-foreground">{selectedMaterial.title}</span> selected — ready to generate
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="mt-4">
            <Textarea
              value={content}
              onChange={e => { setContent(e.target.value); setExtractedContent(e.target.value); setError(''); }}
              placeholder="Paste your notes, textbook content, lecture slides, or any study material here..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{content.length} characters</p>
          </TabsContent>

          <TabsContent value="file" className="mt-4">
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => document.getElementById('exam-file-input').click()}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  {extractedContent
                    ? <span className="text-xs text-green-600 font-medium">✓ Text extracted successfully</span>
                    : <span className="text-xs text-muted-foreground">Extracting text...</span>}
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, Word (.docx), or TXT files</p>
                </>
              )}
              <input id="exam-file-input" type="file" accept=".pdf,.txt,.md,.docx" className="hidden"
                onChange={async (e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setFile(f); setExtractedContent(''); setError('');
                  setStage('Extracting text from file...');
                  const text = await extractTextFromFile(f);
                  setExtractedContent(text);
                  setStage('');
                  if (!text) setError('Could not extract text. Try pasting the text manually.');
                }} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label>Ask a specific question</Label>
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={e => { setQuestion(e.target.value); setError(''); }}
              placeholder="e.g. Explain the difference between process and thread..."
              onKeyDown={e => e.key === 'Enter' && !loading && handleAsk()}
              disabled={loading}
            />
            <Button onClick={handleAsk} disabled={loading || !getContext()}>
              {loading && stage.includes('answer')
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or auto-generate</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button onClick={handleAnalyzeAll} disabled={loading || !getContext()}
          variant="outline" className="w-full rounded-full">
          {loading && stage.includes('Q&A')
            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            : <Sparkles className="w-4 h-4 mr-2" />}
          Generate 8 Important Exam Q&As
        </Button>

        {stage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />{stage}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}
      </div>

      {qaList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-primary" />
              {qaList.length} Answer{qaList.length > 1 ? 's' : ''}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setQaList([])}>Clear all</Button>
          </div>
          <div className="space-y-3">
            {qaList.map((qa, i) => <AnswerBlock key={i} qa={qa} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}