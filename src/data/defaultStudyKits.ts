import { StudyKitResponse } from '../types/studyKit';

export const TRANSFORMER_STUDY_KIT: StudyKitResponse = {
  paperTitle: 'Attention Is All You Need',
  englishSummary: 'This paper introduces the Transformer, an innovative neural network architecture that eliminates recurrence and convolutions entirely. Instead, it relies solely on self-attention mechanisms to model relationships between words across sequences. This design enables massive parallel training, drastically reduces computation time, and achieves state-of-the-art translation accuracy on major benchmark datasets worldwide.',
  romanUrduSummary: 'Yeh paper Transformer model muta\'arif karwata hai jo recurrence aur convolutions ko mukammal khatam karta hai. Is ke bajaye, yeh sirf self-attention mechanisms par munhasir hai taake alfaz ke darmiyan rabt qayam kare. Is design se parallel training mumkin hoti hai, waqt bachta hai, aur translation ke behtareen nataij samne aate hain.',
  wordCount: 50,
  generatedAt: '2024-10-16T12:00:00Z',
  sourceType: 'text',
  fileName: 'Attention_Is_All_You_Need.pdf',
  vocabulary: [
    {
      word: 'Recurrence',
      romanUrduMeaning: 'Baar baar dohrana ya silsilawaar amal',
      contextualExplanation: 'Refers to sequential processing in RNNs where each step strictly depends on the previous hidden state.',
      sourceContext: 'Dispensing with recurrence and convolutions entirely.'
    },
    {
      word: 'Self-Attention',
      romanUrduMeaning: 'Apne hi alfaz par tawajjuh dena',
      contextualExplanation: 'Mechanism relating different positions of a single sequence to compute a contextual representation.',
      sourceContext: 'Self-attention, sometimes called intra-attention, is an attention mechanism relating different positions of a single sequence.'
    },
    {
      word: 'Dot-Product',
      romanUrduMeaning: 'Do vectors ka zarbi natija',
      contextualExplanation: 'Mathematical inner product between query and key vectors calculating similarity scores.',
      sourceContext: 'We compute the dot products of the query with all keys.'
    },
    {
      word: 'Softmax Saturation',
      romanUrduMeaning: 'Gradients ka khatam ho jana',
      contextualExplanation: 'When inputs to softmax are extremely large, causing gradients to vanish and stalling optimization.',
      sourceContext: 'Pushing the softmax function into regions where it has extremely small gradients.'
    },
    {
      word: 'Positional Encoding',
      romanUrduMeaning: 'Tarteeb aur jagah ki nishandahi',
      contextualExplanation: 'Injected mathematical vectors representing token sequence order without recurrent loops.',
      sourceContext: 'To make use of the order of the sequence, we must inject information about relative positions.'
    },
    {
      word: 'Multi-Head Attention',
      romanUrduMeaning: 'Mukhtalif hisson par yakwaqt tawajjuh',
      contextualExplanation: 'Linearly projecting queries, keys, and values into parallel subspaces for richer representation.',
      sourceContext: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces.'
    },
    {
      word: 'Residual Connection',
      romanUrduMeaning: 'Bypassing raasta ya seedha rabt',
      contextualExplanation: 'Skip connection adding layer input directly to its output to avoid vanishing gradients.',
      sourceContext: 'A residual connection followed by layer normalization.'
    },
    {
      word: 'Layer Normalization',
      romanUrduMeaning: 'Features ko standard paimanay par lana',
      contextualExplanation: 'Technique that standardizes feature activations across hidden dimensions per token.',
      sourceContext: 'LayerNorm(x + Sublayer(x)).'
    },
    {
      word: 'Auto-regressive',
      romanUrduMeaning: 'Pichle alfaz se agla lafz banana',
      contextualExplanation: 'Generation process where next token predictions depend strictly on preceding generated tokens.',
      sourceContext: 'Consume the previously generated symbols as additional input when generating the next.'
    },
    {
      word: 'BLEU Score',
      romanUrduMeaning: 'Machine translation naapne ka paimana',
      contextualExplanation: 'Benchmark metric evaluating translation accuracy against human reference translations.',
      sourceContext: 'Achieving 28.4 BLEU on the WMT 2014 English-to-German translation task.'
    }
  ],
  questions: [
    {
      question: 'What is the primary motivation for replacing recurrent layers with self-attention in sequence modeling?',
      answer: 'Recurrent models process tokens sequentially, creating a computational bottleneck that prevents parallelization across GPUs. Self-attention computes pairwise token relationships in parallel, drastically reducing training time while capturing long-range dependencies.',
      type: 'conceptual'
    },
    {
      question: 'Why do the authors divide query-key dot products by the square root of the key dimension (sqrt(d_k))?',
      answer: 'For large vector dimensions, dot products grow substantially in magnitude, pushing the softmax function into flat regions with vanishing gradients. Dividing by sqrt(d_k) normalizes the variance back to 1.0, preserving healthy gradient flow during backpropagation.',
      type: 'methodology'
    },
    {
      question: 'How do sinusoidal positional encodings inform the Transformer of token order without recurrent connections?',
      answer: 'Sinusoidal functions of different frequencies produce unique coordinate vectors that are added directly to token embeddings. Because sine and cosine of offsets can be represented linearly, the model learns relative distances between tokens.',
      type: 'conceptual'
    },
    {
      question: 'What empirical benchmark translation results did the Transformer achieve on WMT 2014?',
      answer: 'The Transformer achieved 28.4 BLEU on English-to-German (improving by over 2.0 BLEU on existing ensembles) and 41.8 BLEU on English-to-French after only 3.5 days of training on 8 P100 GPUs.',
      type: 'findings'
    },
    {
      question: 'What is the main computational limitation of standard full self-attention for extremely long sequences?',
      answer: 'Standard self-attention has a quadratic computational and memory complexity of O(n^2) with respect to sequence length n, making it computationally expensive for extreme context windows without sparse or linear approximations.',
      type: 'critical_thinking'
    }
  ],
  limitations: [
    'Quadratic computational complexity O(n^2) with respect to input sequence length.',
    'Total loss of intrinsic temporal inductive bias, requiring synthetic positional embeddings.'
  ]
};

export const ALPHAFOLD_STUDY_KIT: StudyKitResponse = {
  paperTitle: 'Highly accurate protein structure prediction with AlphaFold',
  englishSummary: 'This landmark research introduces AlphaFold, an artificial intelligence system that solves the fundamental fifty-year biological challenge of predicting 3D protein structures directly from primary amino acid sequences. By combining evolutionary co-variation across sequence alignments with spatial geometric attention, it achieves atomic accuracy comparable to experimental crystallography and cryo-electron microscopy techniques worldwide.',
  romanUrduSummary: 'Yeh tareekhi research AlphaFold AI system muta\'arif karwati hai jo 50 saal purana protein structure prediction ka challenge hal karta hai. Amino acid sequences aur evolutionary co-variation ko geometric deep learning ke zariye jor kar, yeh system experimental tareeqon jesi atomic accuracy hasil karta hai.',
  wordCount: 50,
  generatedAt: '2024-10-16T12:00:00Z',
  sourceType: 'text',
  fileName: 'AlphaFold2_Nature.pdf',
  vocabulary: [
    {
      word: 'Multiple Sequence Alignment (MSA)',
      romanUrduMeaning: 'Mukhtalif species ke sequences ka mawazna',
      contextualExplanation: 'Arrangement of homologous protein sequences to reveal evolutionary conserved patterns.',
      sourceContext: 'Operates directly on primary amino acid sequences and multiple sequence alignments.'
    },
    {
      word: 'Evoformer',
      romanUrduMeaning: 'Evolution aur geometry ka neural network',
      contextualExplanation: 'Core dual-track neural architecture exchanging information between MSA and residue pair spatial features.',
      sourceContext: 'The core building block is the Evoformer architecture.'
    },
    {
      word: 'Invariant Point Attention (IPA)',
      romanUrduMeaning: '3D angle aur coordinate par munhasir tawajjuh',
      contextualExplanation: 'Attention mechanism invariant to global 3D rotations and translations of the protein.',
      sourceContext: 'Structure module with invariant point attention.'
    },
    {
      word: 'pLDDT',
      romanUrduMeaning: 'Confidence naapne ka paimana (0 se 100)',
      contextualExplanation: 'Per-residue predicted Local Distance Difference Test measuring local structural certainty.',
      sourceContext: 'Produces a per-residue confidence metric termed pLDDT.'
    },
    {
      word: 'Intrinsically Disordered Region (IDR)',
      romanUrduMeaning: 'Be-dhol ya lachakdar protein hissa',
      contextualExplanation: 'Protein segments lacking stable tertiary 3D structure under physiological conditions.',
      sourceContext: 'Regions with pLDDT below 50 often correspond to intrinsically disordered protein regions.'
    },
    {
      word: 'Frame Alignment Point Error (FAPE)',
      romanUrduMeaning: 'Frame ke hisab se atomic ghalati naapna',
      contextualExplanation: 'Loss function penalizing coordinate deviations relative to local residue coordinate frames.',
      sourceContext: 'FAPE loss compares predicted and true atom positions.'
    },
    {
      word: 'Rigid Body Frame',
      romanUrduMeaning: 'Thos 3D dhaancho ka frame',
      contextualExplanation: 'Mathematical formulation of residue backbones having both rotation and translation in SE(3).',
      sourceContext: 'Residues represented by independent rigid body coordinate frames.'
    },
    {
      word: 'Side Chain Torsion',
      romanUrduMeaning: 'Amino acid ke baazuon ka ghumao',
      contextualExplanation: 'Chi angles (chi1 to chi4) specifying spatial conformation of amino acid side chains.',
      sourceContext: 'Predicts side chain torsion angles continuously.'
    },
    {
      word: 'Levinthal Paradox',
      romanUrduMeaning: 'Protein folding ke bay-shumar raste',
      contextualExplanation: 'Calculated astronomical number of potential conformations a protein could theoretically fold into.',
      sourceContext: 'Resolving the conformational search problem posed by Levinthal.'
    },
    {
      word: 'GDT (Global Distance Test)',
      romanUrduMeaning: 'Majmooi fasla jaanchne ka score',
      contextualExplanation: 'Key CASP benchmark metric quantifying overall protein backbone prediction accuracy.',
      sourceContext: 'Achieved median GDT score above 90 in CASP14.'
    }
  ],
  questions: [
    {
      question: 'How does AlphaFold leverage Multiple Sequence Alignments (MSAs) to infer 3D protein structures?',
      answer: 'Across millions of years of evolution, if two residues physically contact each other, a mutation in one residue often forces a compensatory mutation in the other. AlphaFold detects these correlated mutations to infer spatial proximity.',
      type: 'methodology'
    },
    {
      question: 'What is the function of Invariant Point Attention (IPA) in the Structure Module?',
      answer: 'IPA operates directly on local 3D residue coordinate frames. It computes spatial queries, keys, and values that remain invariant under global rigid-body rotations and translations in SE(3) space.',
      type: 'conceptual'
    },
    {
      question: 'What is the significance of a pLDDT score below 50 in AlphaFold predictions?',
      answer: 'Scores below 50 typically identify Intrinsically Disordered Regions (IDRs) that biologically lack a fixed 3D structure in isolation, rather than a failure of the machine learning model.',
      type: 'findings'
    },
    {
      question: 'Why did the authors replace standard RMSD loss with Frame Alignment Point Error (FAPE)?',
      answer: 'FAPE computes atomic errors relative to each local residue coordinate frame, making the loss rotationally and translationally invariant without requiring computationally expensive global structural superimpositions.',
      type: 'methodology'
    },
    {
      question: 'What are the main biological limitations of the original AlphaFold model?',
      answer: 'The initial system cannot predict structural changes induced by small-molecule ligand binding, metal ions, covalent post-translational modifications, or multi-protein complexes without multimer extensions.',
      type: 'critical_thinking'
    }
  ],
  limitations: [
    'Does not natively model small-molecule drug ligand binding or enzymatic transition states.',
    'Cannot predict structural changes induced by post-translational modifications.'
  ]
};
