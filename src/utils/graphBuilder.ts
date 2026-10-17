import { PaperData, KnowledgeGraphData, GraphNode, GraphLink } from '../types';

export function buildPaperKnowledgeGraph(paper: PaperData): KnowledgeGraphData {
  if (paper.knowledgeGraph && paper.knowledgeGraph.nodes.length > 0) {
    return paper.knowledgeGraph;
  }

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // 1. Core Innovation Node (Central Hub)
  const coreId = `node-core-${paper.id}`;
  nodes.push({
    id: coreId,
    label: paper.shortTitle || paper.title,
    group: 'core',
    description: paper.executiveSummary.coreInnovation,
    taxonomy: paper.fieldTag,
    importance: 5,
  });

  // 2. Problem Statement Node (Challenge)
  const problemId = `node-prob-${paper.id}`;
  nodes.push({
    id: problemId,
    label: 'Fundamental Bottleneck',
    group: 'challenge',
    description: paper.executiveSummary.problemStatement,
    importance: 4,
  });
  links.push({
    source: coreId,
    target: problemId,
    relationship: 'Solves & Replaces',
    strength: 1.2,
  });

  // 3. Concept Nodes
  paper.concepts.forEach((concept, idx) => {
    const conceptNodeId = `node-concept-${concept.id}`;
    nodes.push({
      id: conceptNodeId,
      label: concept.title.split(':')[0],
      group: 'concept',
      description: concept.summary,
      quote: concept.keyQuote,
      taxonomy: concept.taxonomy,
      importance: 4,
      relatedConceptId: concept.id,
    });

    // Connect core to each concept
    links.push({
      source: coreId,
      target: conceptNodeId,
      relationship: idx === 0 ? 'Primary Mechanism' : 'Architectural Component',
      strength: 1.0,
    });

    // Connect concepts sequentially if consecutive
    if (idx > 0) {
      const prevConceptId = `node-concept-${paper.concepts[idx - 1].id}`;
      links.push({
        source: prevConceptId,
        target: conceptNodeId,
        relationship: 'Feeds Into',
        strength: 0.6,
      });
    }
  });

  // 4. Formula Nodes
  paper.vocabularyAndFormulas
    .filter(v => v.isFormula || v.formula)
    .slice(0, 4)
    .forEach((item, fIdx) => {
      const formulaNodeId = `node-form-${item.id}`;
      nodes.push({
        id: formulaNodeId,
        label: item.term,
        group: 'formula',
        description: item.definition,
        formula: item.formula,
        taxonomy: 'Mathematical Formulation',
        importance: 3,
      });

      // Link to a corresponding concept if available, otherwise core
      const targetConcept = paper.concepts[fIdx % paper.concepts.length];
      if (targetConcept) {
        links.push({
          source: `node-concept-${targetConcept.id}`,
          target: formulaNodeId,
          relationship: 'Mathematized By',
          strength: 0.8,
        });
      } else {
        links.push({
          source: coreId,
          target: formulaNodeId,
          relationship: 'Formalized As',
          strength: 0.8,
        });
      }
    });

  // 5. Methodology Steps (Key phases)
  paper.executiveSummary.methodologyPipeline.slice(0, 3).forEach((step, sIdx) => {
    const stepNodeId = `node-meth-${paper.id}-${sIdx}`;
    nodes.push({
      id: stepNodeId,
      label: `Pipeline Phase ${sIdx + 1}`,
      group: 'methodology',
      description: step,
      taxonomy: 'Experimental Pipeline',
      importance: 3,
    });

    links.push({
      source: coreId,
      target: stepNodeId,
      relationship: 'Executes via',
      strength: 0.7,
    });
  });

  // 6. Empirical Findings Nodes
  paper.executiveSummary.keyFindings.slice(0, 2).forEach((finding, findIdx) => {
    const findingNodeId = `node-find-${paper.id}-${findIdx}`;
    nodes.push({
      id: findingNodeId,
      label: `Empirical Result ${findIdx + 1}`,
      group: 'finding',
      description: finding,
      taxonomy: 'Benchmark Validation',
      importance: 3,
    });

    // Connect to core
    links.push({
      source: coreId,
      target: findingNodeId,
      relationship: 'Yields Metric',
      strength: 0.75,
    });
  });

  return { nodes, links };
}
