import type { CollectionEntry } from 'astro:content';

export type WikiEntry = CollectionEntry<'wiki'>;

export interface WikiListItem {
  slug: string;
  title: string;
  type: WikiEntry['data']['type'];
  tags: string[];
  updated: string;
}

export interface GraphNode {
  id: string;
  title: string;
  type: WikiEntry['data']['type'];
  tags: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}