import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Layers,
  BarChart3,
  PieChart,
  Network,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Server,
  Building2,
  Cpu,
  Shield,
  Eye,
  Info,
  ChevronRight,
  Maximize2,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Flame
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TreemapLeaf {
  id: string;
  name: string;
  model: string;
  deviceType: string;
  status: 'OPERATIONAL_ACTIVE' | 'MAINTENANCE_REQUIRED' | 'STANDBY_BACKUP';
  value: number;
  ip: string;
  criticality: 'HIGH' | 'MISSION_CRITICAL' | 'MEDIUM';
  isFlaggedHighRisk?: boolean;
  riskScore?: number;
  isOverdue?: boolean;
}

interface TreemapSite {
  id: string;
  name: string;
  nameKu: string;
  siteCode: string;
  children: TreemapLeaf[];
}

interface TreemapRoot {
  name: string;
  children: TreemapSite[];
}

interface SiteBarData {
  siteId: string;
  siteCode: string;
  siteNameEn: string;
  siteNameKu: string;
  operational: number;
  maintenance: number;
  standby: number;
  total: number;
  powerWatts: number;
}

interface DonutData {
  status: string;
  labelEn: string;
  labelKu: string;
  count: number;
  percentage: number;
  color: string;
}

interface TypeDistData {
  type: string;
  count: number;
  operational: number;
  maintenance: number;
}

interface TopologyNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  labelKu?: string;
  group: 'HUB' | 'SITE' | 'ASSET';
  radius: number;
  color: string;
  siteCode?: string;
  totalAssets?: number;
  model?: string;
  deviceType?: string;
  status?: string;
}

interface TopologyLink extends d3.SimulationLinkDatum<TopologyNode> {
  source: string | TopologyNode;
  target: string | TopologyNode;
  value: number;
}

interface UtilizationApiResponse {
  success: boolean;
  serverTimestamp: string;
  metrics: {
    totalPhysicalAssets: number;
    totalSitesMapped: number;
    operationalCount: number;
    maintenanceCount: number;
    standbyCount: number;
    fleetUtilizationRate: number;
    totalPowerWatts: number;
    maintenanceTicketsActive: number;
  };
  hierarchicalTreemap: TreemapRoot;
  siteDistributionBars: SiteBarData[];
  statusDonutData: DonutData[];
  typeDistribution: TypeDistData[];
  networkTopology: {
    nodes: TopologyNode[];
    links: TopologyLink[];
  };
}

export const AssetUtilizationDashboardView: React.FC = () => {
  const { language } = useLanguage();
  const [data, setData] = useState<UtilizationApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'TREEMAP' | 'BAR_CHART' | 'DONUT' | 'TOPOLOGY'>('TREEMAP');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<TreemapLeaf | null>(null);
  const [barMetricMode, setBarMetricMode] = useState<'COUNT' | 'POWER'>('COUNT');
  const [onlyHighRisk, setOnlyHighRisk] = useState<boolean>(false);

  // SVG Refs for D3 Renderings
  const treemapSvgRef = useRef<SVGSVGElement | null>(null);
  const barChartSvgRef = useRef<SVGSVGElement | null>(null);
  const donutSvgRef = useRef<SVGSVGElement | null>(null);
  const topologySvgRef = useRef<SVGSVGElement | null>(null);

  // Fetch utilization dataset
  const fetchUtilizationData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/it-assets/utilization');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return;
      }
      const json: UtilizationApiResponse = await res.json();
      if (json.success) {
        setData(json);
        setError(null);
      } else {
        throw new Error('Failed to retrieve utilization analytics');
      }
    } catch (err: any) {
      console.error('Error fetching IT asset utilization:', err);
      setError(err.message || 'Error connecting to IT asset utilization service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilizationData();
  }, []);

  // Quick simulation trigger to test live status change
  const handleSimulateStatus = async (assetId: string, targetStatus?: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/it-assets/utilization/simulate-status-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, targetStatus })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return;
      }
      const resJson = await res.json();
      if (resJson.success) {
        setSimulationMessage(language === 'ku' ? resJson.messageKu : resJson.messageEn);
        await fetchUtilizationData();
        setTimeout(() => setSimulationMessage(null), 6000);
      }
    } catch (err: any) {
      console.error('Failed to simulate status change:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // ==========================================
  // 1. D3 TREEMAP RENDERER
  // ==========================================
  useEffect(() => {
    if (activeViewMode !== 'TREEMAP' || !data || !treemapSvgRef.current) return;

    const svg = d3.select(treemapSvgRef.current);
    svg.selectAll('*').remove();

    const width = 960;
    const height = 520;
    const margin = { top: 20, right: 10, bottom: 20, left: 10 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Filter treemap data if site filter or status filter is applied
    let filteredChildren = data.hierarchicalTreemap.children;
    if (selectedSiteFilter !== 'ALL') {
      filteredChildren = filteredChildren.filter(s => s.id === selectedSiteFilter);
    }

    const filteredHierarchy = {
      name: data.hierarchicalTreemap.name,
      children: filteredChildren.map(site => ({
        ...site,
        children: site.children.filter(asset => {
          const matchStatus = statusFilter === 'ALL' || asset.status === statusFilter;
          const matchRisk = !onlyHighRisk || asset.isFlaggedHighRisk;
          const matchSearch = !searchQuery || 
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            asset.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
            asset.deviceType.toLowerCase().includes(searchQuery.toLowerCase());
          return matchStatus && matchRisk && matchSearch;
        })
      })).filter(s => s.children.length > 0)
    };

    if (filteredHierarchy.children.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '16px')
        .attr('font-weight', '600')
        .text(language === 'ku' ? 'هیچ ئامێرێک لەم فلتەرەدا نەدۆزرایەوە' : 'No assets matched the current filters');
      return;
    }

    const rootHierarchy = d3.hierarchy<any>(filteredHierarchy)
      .sum(d => d.value || 100)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3.treemap<any>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .paddingTop(28)
      .paddingInner(4)
      .paddingOuter(6)
      .round(true);

    const root: d3.HierarchyRectangularNode<any> = treemapLayout(rootHierarchy);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color mapper
    const statusColor = (status: string) => {
      switch (status) {
        case 'OPERATIONAL_ACTIVE': return '#10b981'; // emerald
        case 'MAINTENANCE_REQUIRED': return '#ef4444'; // rose
        case 'STANDBY_BACKUP': return '#6366f1'; // indigo
        default: return '#94a3b8';
      }
    };

    // Render Site Group Containers
    const siteGroups = g.selectAll('g.site-group')
      .data(root.children || [])
      .enter()
      .append('g')
      .attr('class', 'site-group');

    // Site header background bar
    siteGroups.append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', 24)
      .attr('fill', '#1e293b')
      .attr('rx', 6);

    // Site Title Label
    siteGroups.append('text')
      .attr('x', (d: any) => d.x0 + 10)
      .attr('y', (d: any) => d.y0 + 16)
      .attr('fill', '#f8fafc')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d: any) => {
        const title = language === 'ku' ? (d.data.nameKu || d.data.name) : d.data.name;
        const count = d.data.children?.length || 0;
        return `${title} (${count} ${language === 'ku' ? 'ئامێر' : 'Units'})`;
      });

    // Site outline frame
    siteGroups.append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5)
      .attr('rx', 6);

    // Render Asset Leaf Tiles
    const leafNodes = g.selectAll('g.leaf-node')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'leaf-node')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer')
      .on('click', (_, d: any) => {
        setSelectedAssetDetail(d.data as TreemapLeaf);
      });

    // Tile Rectangle with smooth transition & High Risk highlight stroke
    leafNodes.append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => statusColor(d.data.status))
      .attr('fill-opacity', 0.88)
      .attr('stroke', (d: any) => d.data.isFlaggedHighRisk ? '#dc2626' : '#ffffff')
      .attr('stroke-width', (d: any) => d.data.isFlaggedHighRisk ? 3 : 1.5)
      .attr('stroke-dasharray', (d: any) => d.data.isFlaggedHighRisk ? '5,3' : 'none')
      .attr('rx', 4)
      .on('mouseenter', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill-opacity', 1.0)
          .attr('stroke-width', 3.5);
      })
      .on('mouseleave', function (event, d: any) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill-opacity', 0.88)
          .attr('stroke-width', d.data.isFlaggedHighRisk ? 3 : 1.5);
      });

    // Asset Tag Label inside tile
    leafNodes.append('text')
      .attr('x', 6)
      .attr('y', 15)
      .attr('fill', '#ffffff')
      .attr('font-size', (d: any) => {
        const w = d.x1 - d.x0;
        return w < 75 ? '9px' : '11px';
      })
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 45 || h < 26) return '';
        return d.data.name;
      });

    // Device Model & Type subtitle inside tile if height permits
    leafNodes.append('text')
      .attr('x', 6)
      .attr('y', 29)
      .attr('fill', 'rgba(255,255,255,0.92)')
      .attr('font-size', '9px')
      .style('pointer-events', 'none')
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 90 || h < 46) return '';
        return `${d.data.deviceType}`;
      });

    // Power Wattage tag in corner if large enough
    leafNodes.append('text')
      .attr('x', 6)
      .attr('y', 42)
      .attr('fill', 'rgba(255,255,255,0.8)')
      .attr('font-size', '8px')
      .style('pointer-events', 'none')
      .text((d: any) => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        if (w < 110 || h < 58) return '';
        return `${d.data.value}W • ${d.data.ip}`;
      });

    // High Risk badge text inside tile if flagged
    leafNodes.filter((d: any) => d.data.isFlaggedHighRisk)
      .append('text')
      .attr('x', (d: any) => Math.max(0, d.x1 - d.x0) - 6)
      .attr('y', 14)
      .attr('text-anchor', 'end')
      .attr('fill', '#ffffff')
      .attr('font-size', '8px')
      .attr('font-weight', '900')
      .style('pointer-events', 'none')
      .text((d: any) => (d.x1 - d.x0 > 75) ? '⚠️ HIGH RISK' : '⚠️');

    // SVG Native Tooltip Title
    leafNodes.append('title')
      .text((d: any) => `[${d.data.name}] ${d.data.model}\nSite: ${d.parent?.data.name}\nStatus: ${d.data.status}${d.data.isFlaggedHighRisk ? ' [FLAGGED HIGH RISK]' : ''}${d.data.isOverdue ? ' [OVERDUE SLA]' : ''}\nRisk Score: ${d.data.riskScore || 'Normal'}/100\nPower: ${d.data.value}W\nIP: ${d.data.ip}\nCriticality: ${d.data.criticality}`);

  }, [activeViewMode, data, selectedSiteFilter, statusFilter, searchQuery, onlyHighRisk, language]);

  // ==========================================
  // 2. D3 STACKED & GROUPED BAR CHART RENDERER
  // ==========================================
  useEffect(() => {
    if (activeViewMode !== 'BAR_CHART' || !data || !barChartSvgRef.current) return;

    const svg = d3.select(barChartSvgRef.current);
    svg.selectAll('*').remove();

    const width = 960;
    const height = 480;
    const margin = { top: 40, right: 30, bottom: 90, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const barData = data.siteDistributionBars;

    // X Scale
    const x0 = d3.scaleBand()
      .domain(barData.map(d => language === 'ku' ? d.siteNameKu : d.siteNameEn))
      .range([0, innerWidth])
      .padding(0.28);

    if (barMetricMode === 'COUNT') {
      // Stack Keys: operational, maintenance, standby
      const keys = ['operational', 'maintenance', 'standby'];
      const stack = d3.stack<SiteBarData>()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      const series = stack(barData);
      const maxY = (d3.max(barData, (d: SiteBarData) => d.total) as number) || 5;

      const y = d3.scaleLinear()
        .domain([0, Math.ceil(maxY * 1.25)])
        .nice()
        .range([innerHeight, 0]);

      const colorMap: Record<string, string> = {
        operational: '#10b981',
        maintenance: '#ef4444',
        standby: '#6366f1'
      };

      // Grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3.axisLeft(y)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', '#f1f5f9')
        .attr('stroke-dasharray', '3,3');

      // Stack Groups
      const layer = g.selectAll('g.layer')
        .data(series)
        .enter()
        .append('g')
        .attr('class', 'layer')
        .attr('fill', d => colorMap[d.key]);

      layer.selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', (d: any) => x0(language === 'ku' ? d.data.siteNameKu : d.data.siteNameEn) || 0)
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('width', x0.bandwidth())
        .attr('rx', 3)
        .transition()
        .duration(600)
        .delay((_, i) => i * 40)
        .attr('y', (d: any) => y(d[1]))
        .attr('height', (d: any) => Math.max(0, y(d[0]) - y(d[1])));

      // Total count numbers on top of each bar
      g.selectAll('text.bar-total-label')
        .data(barData)
        .enter()
        .append('text')
        .attr('class', 'bar-total-label')
        .attr('x', (d: any) => (x0(language === 'ku' ? d.siteNameKu : d.siteNameEn) || 0) + x0.bandwidth() / 2)
        .attr('y', (d: any) => y(d.total) - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#334155')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text((d: any) => `${d.total} units`);

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x0))
        .selectAll('text')
        .attr('transform', 'rotate(-25)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.6em')
        .attr('dy', '0.6em')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', '#475569');

      // Y Axis
      g.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .selectAll('text')
        .attr('font-size', '11px')
        .attr('fill', '#64748b');

    } else {
      // Power Wattage mode
      const maxY = (d3.max(barData, (d: SiteBarData) => d.powerWatts) as number) || 2000;
      const y = d3.scaleLinear()
        .domain([0, Math.ceil(maxY * 1.2)])
        .nice()
        .range([innerHeight, 0]);

      // Grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3.axisLeft(y)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', '#f1f5f9');

      // Power bars
      g.selectAll('rect.power-bar')
        .data(barData)
        .enter()
        .append('rect')
        .attr('class', 'power-bar')
        .attr('x', (d: any) => x0(language === 'ku' ? d.siteNameKu : d.siteNameEn) || 0)
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('width', x0.bandwidth())
        .attr('fill', '#3b82f6')
        .attr('rx', 4)
        .transition()
        .duration(600)
        .delay((_, i) => i * 40)
        .attr('y', (d: any) => y(d.powerWatts))
        .attr('height', (d: any) => Math.max(0, innerHeight - y(d.powerWatts)));

      // Wattage text on top
      g.selectAll('text.power-label')
        .data(barData)
        .enter()
        .append('text')
        .attr('class', 'power-label')
        .attr('x', (d: any) => (x0(language === 'ku' ? d.siteNameKu : d.siteNameEn) || 0) + x0.bandwidth() / 2)
        .attr('y', (d: any) => y(d.powerWatts) - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1d4ed8')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text((d: any) => `${d.powerWatts}W`);

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x0))
        .selectAll('text')
        .attr('transform', 'rotate(-25)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.6em')
        .attr('dy', '0.6em')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', '#475569');

      // Y Axis
      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}W`))
        .selectAll('text')
        .attr('font-size', '11px')
        .attr('fill', '#64748b');
    }

  }, [activeViewMode, data, barMetricMode, language]);

  // ==========================================
  // 3. D3 RADIAL FLEET STATUS DONUT RENDERER
  // ==========================================
  useEffect(() => {
    if (activeViewMode !== 'DONUT' || !data || !donutSvgRef.current) return;

    const svg = d3.select(donutSvgRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 420;
    const radius = Math.min(width, height) / 2 - 30;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<DonutData>()
      .value(d => d.count)
      .sort(null)
      .padAngle(0.04);

    const arc = d3.arc<d3.PieArcDatum<DonutData>>()
      .innerRadius(radius * 0.58)
      .outerRadius(radius * 0.92)
      .cornerRadius(6);

    const arcHover = d3.arc<d3.PieArcDatum<DonutData>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius * 0.98)
      .cornerRadius(8);

    const arcs = g.selectAll('g.slice')
      .data(pie(data.statusDonutData))
      .enter()
      .append('g')
      .attr('class', 'slice')
      .style('cursor', 'pointer');

    arcs.append('path')
      .attr('d', arc as any)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .on('mouseenter', function (_, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover as any);
      })
      .on('mouseleave', function (_, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc as any);
      });

    // Donut Center Text: Fleet Utilization Rate %
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('font-size', '34px')
      .attr('font-weight', '900')
      .attr('fill', '#0f172a')
      .text(`${data.metrics.fleetUtilizationRate}%`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.6em')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#64748b')
      .text(language === 'ku' ? 'ئامادەباشی تەواو' : 'Operational Readiness');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '3.2em')
      .attr('font-size', '10px')
      .attr('fill', '#94a3b8')
      .text(`${data.metrics.operationalCount} / ${data.metrics.totalPhysicalAssets} ${language === 'ku' ? 'ئامێر' : 'Assets'}`);

  }, [activeViewMode, data, language]);

  // ==========================================
  // 4. D3 FORCE-DIRECTED NETWORK TOPOLOGY RENDERER
  // ==========================================
  useEffect(() => {
    if (activeViewMode !== 'TOPOLOGY' || !data || !topologySvgRef.current) return;

    const svg = d3.select(topologySvgRef.current);
    svg.selectAll('*').remove();

    const width = 960;
    const height = 540;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Clone nodes and links to prevent D3 mutation issues across re-renders
    const nodes: TopologyNode[] = data.networkTopology.nodes.map(d => ({ ...d }));
    const links: TopologyLink[] = data.networkTopology.links.map(d => ({ ...d }));

    const container = svg.append('g').attr('class', 'topology-container');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3.5])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const simulation = d3.forceSimulation<TopologyNode>(nodes)
      .force('link', d3.forceLink<TopologyNode, TopologyLink>(links).id(d => d.id).distance(d => {
        const sourceGroup = typeof d.source === 'object' ? (d.source as TopologyNode).group : '';
        return sourceGroup === 'HUB' ? 140 : 65;
      }))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as TopologyNode).radius + 12));

    // Render Links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.65)
      .attr('stroke-width', d => d.value === 3 ? 2.5 : 1.2)
      .attr('stroke-dasharray', d => d.value === 3 ? 'none' : '4,2');

    // Render Node Elements
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g.node-item')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .style('cursor', 'grab')
      .call(
        d3.drag<any, TopologyNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node Outer Pulse/Ring for alerts
    node.filter(d => d.status === 'MAINTENANCE_REQUIRED')
      .append('circle')
      .attr('r', d => d.radius + 6)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.85);

    // Main Node Circle
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', d => d.group === 'HUB' ? 3 : 1.5)
      .attr('shadow', '0 4px 6px -1px rgb(0 0 0 / 0.1)');

    // Text Label below nodes
    node.append('text')
      .attr('dy', d => d.radius + 13)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1e293b')
      .attr('font-size', d => d.group === 'HUB' ? '12px' : d.group === 'SITE' ? '10px' : '8px')
      .attr('font-weight', d => d.group === 'HUB' ? '800' : '600')
      .text(d => language === 'ku' ? (d.labelKu || d.label) : d.label);

    // Node tooltips
    node.append('title')
      .text(d => `${d.label} [${d.group}]\n${d.model || ''} ${d.status ? `\nStatus: ${d.status}` : ''}`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as TopologyNode).x || 0)
        .attr('y1', d => (d.source as TopologyNode).y || 0)
        .attr('x2', d => (d.target as TopologyNode).x || 0)
        .attr('y2', d => (d.target as TopologyNode).y || 0);

      node
        .attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };

  }, [activeViewMode, data, language]);

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                D3.js Visualization Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-[11px] font-mono border border-indigo-400/20">
                Holding IT Fleet
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Layers className="w-8 h-8 text-indigo-400" />
              <span>
                {language === 'ku'
                  ? 'داشبۆردی بەکارهێنانی ئامێرە فیزیاییەکان (D3)'
                  : 'Physical Asset Utilization & Distribution Dashboard'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'ku'
                ? 'شیکاری ڕاستەوخۆی دابەشبوونی ١٤ سێرڤەر و ئامێری تۆڕ بەسەر ٧ بنکە مەیدانییەکانی هۆڵدینگ بە بەکارهێنانی نەخشەی درەختی هێرارکی، ستوونەکان، و تۆپۆلۆجی لەگەڵ چاودێری دۆخی چاککردنەوە.'
                : 'Real-time D3 hierarchical distribution of hardware assets across 7 enterprise project sites, monitoring maintenance status, operational readiness, power load, and physical network topology.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fetchUtilizationData()}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>{language === 'ku' ? 'نوێکردنەوەی داتا' : 'Refresh Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Cards */}
        {data && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-slate-400 block">
                {language === 'ku' ? 'کۆی گشتی ئامێرەکان' : 'Total Hardware Units'}
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {data.metrics.totalPhysicalAssets}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {data.metrics.totalSitesMapped} {language === 'ku' ? 'بنکەی جێگیرکراو' : 'Sites Mapped'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'ku' ? 'چالاک و لەکاردا' : 'Operational Active'}
              </span>
              <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                {data.metrics.operationalCount}
              </div>
              <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                {Math.round((data.metrics.operationalCount / data.metrics.totalPhysicalAssets) * 100)}% {language === 'ku' ? 'لە تەواوی بەستراوەکان' : 'of Total Fleet'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {language === 'ku' ? 'پێویستی بە چاککردنەوە' : 'Maintenance Required'}
              </span>
              <div className="text-2xl font-black font-mono text-rose-300 mt-1">
                {data.metrics.maintenanceCount}
              </div>
              <span className="text-[10px] text-rose-400/80 mt-0.5 block">
                {data.metrics.maintenanceTicketsActive} {language === 'ku' ? 'تیکتی کراوە' : 'Active Tickets'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-indigo-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {language === 'ku' ? 'یه‌ده‌گ (Standby)' : 'Standby Hot-Spares'}
              </span>
              <div className="text-2xl font-black font-mono text-indigo-300 mt-1">
                {data.metrics.standbyCount}
              </div>
              <span className="text-[10px] text-indigo-400/80 mt-0.5 block">
                {language === 'ku' ? 'ئامادە بۆ گۆڕین' : 'Ready for Failover'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                {language === 'ku' ? 'ڕێژەی بەکارهێنان' : 'Fleet Utilization'}
              </span>
              <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                {data.metrics.fleetUtilizationRate}%
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-1.5 rounded-full"
                  style={{ width: `${data.metrics.fleetUtilizationRate}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-blue-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {language === 'ku' ? 'بڕی وزەی کێشراو' : 'Total Power Draw'}
              </span>
              <div className="text-2xl font-black font-mono text-blue-300 mt-1">
                {(data.metrics.totalPowerWatts / 1000).toFixed(1)} kW
              </div>
              <span className="text-[10px] text-blue-400/80 mt-0.5 block font-mono">
                {data.metrics.totalPowerWatts} Watts Total
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Simulation Feedback Alert if Triggered */}
      {simulationMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>{simulationMessage}</span>
          </div>
          <button
            onClick={() => setSimulationMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* View Mode Toolbar & Interactive Filters */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveViewMode('TREEMAP')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeViewMode === 'TREEMAP'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{language === 'ku' ? 'نەخشەی درەختی (D3 Treemap)' : 'D3 Hierarchical Treemap'}</span>
            </button>

            <button
              onClick={() => setActiveViewMode('BAR_CHART')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeViewMode === 'BAR_CHART'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{language === 'ku' ? 'ستوونی دابەشبوون (D3 Bars)' : 'D3 Site Distribution'}</span>
            </button>

            <button
              onClick={() => setActiveViewMode('DONUT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeViewMode === 'DONUT'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>{language === 'ku' ? 'دۆخی چاککردنەوە (D3 Radial)' : 'D3 Maintenance Radial'}</span>
            </button>

            <button
              onClick={() => setActiveViewMode('TOPOLOGY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeViewMode === 'TOPOLOGY'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>{language === 'ku' ? 'تۆڕی تۆپۆلۆجی (D3 Force Graph)' : 'D3 Force Network Topology'}</span>
            </button>
          </div>

          {/* Sub-toggles for specific view modes */}
          {activeViewMode === 'BAR_CHART' && (
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 px-2">Metric:</span>
              <button
                onClick={() => setBarMetricMode('COUNT')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  barMetricMode === 'COUNT' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                {language === 'ku' ? 'ژمارەی ئامێر' : 'Asset Count'}
              </button>
              <button
                onClick={() => setBarMetricMode('POWER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  barMetricMode === 'POWER' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                {language === 'ku' ? 'کێشانی کارەبا (Watts)' : 'Power (Watts)'}
              </button>
            </div>
          )}

          {/* Quick Simulation Trigger Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'ku' ? 'تاقیگە:' : 'Simulate:'}</span>
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleSimulateStatus(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
            >
              <option value="" disabled>
                {language === 'ku' ? 'گۆڕینی دۆخی ئامێر بۆ تاقیکردنەوە...' : 'Toggle Device Maintenance...'}
              </option>
              {data?.hierarchicalTreemap.children.flatMap(s => s.children).map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} - {asset.model} ({asset.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'ku' ? 'گەڕان بەدوای تابلۆ، مۆدێل، یان جۆری ئامێر...' : 'Search by asset tag, model, or hardware type...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">{language === 'ku' ? 'هەموو بنکەکان (All Sites)' : 'All Project Sites'}</option>
              {data?.siteDistributionBars.map(site => (
                <option key={site.siteId} value={site.siteId}>
                  {language === 'ku' ? site.siteNameKu : site.siteNameEn}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">{language === 'ku' ? 'هەموو دۆخەکان' : 'All Statuses'}</option>
              <option value="OPERATIONAL_ACTIVE">OPERATIONAL_ACTIVE</option>
              <option value="MAINTENANCE_REQUIRED">MAINTENANCE_REQUIRED</option>
              <option value="STANDBY_BACKUP">STANDBY_BACKUP</option>
            </select>

            <button
              onClick={() => setOnlyHighRisk(!onlyHighRisk)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                onlyHighRisk
                  ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'تەنها مەترسی باڵا' : 'High Risk Only'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main D3 Visualization Canvas Viewports */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative">
        {/* VIEW 1: D3 TREEMAP */}
        {activeViewMode === 'TREEMAP' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>{language === 'ku' ? 'دابەشبوونی قەبارە و شوێنی ئامێرەکان بەپێی وێستگە' : 'Hierarchical Treemap of Physical Assets by Site'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ku'
                    ? 'هەر خانەیەک گوزارشت لە ئامێرێک دەکات، قەبارەی خانە بەپێی واتای کارەبای ئامێرەکەیە، ڕەنگی سەوز (چالاک)، سور (پێویستی بە چاککردنەوە)، و وەنەوشەیی (یه‌ده‌گ).'
                    : 'Tiles are nested under project sites and scaled by rated power wattage (W). Emerald represents Operational Active, Rose indicates Maintenance Required, and Indigo indicates Standby Spares.'}
                </p>
              </div>

              {/* Treemap Legend */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="font-semibold text-slate-700">Operational</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500" />
                  <span className="font-semibold text-slate-700">Maintenance</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                  <span className="font-semibold text-slate-700">Standby</span>
                </span>
              </div>
            </div>

            {/* Treemap SVG */}
            <div className="w-full overflow-x-auto bg-slate-50/50 rounded-2xl p-2 border border-slate-100">
              <svg ref={treemapSvgRef} className="w-full h-auto min-h-[480px]" />
            </div>
          </div>
        )}

        {/* VIEW 2: D3 BAR CHART */}
        {activeViewMode === 'BAR_CHART' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>
                    {barMetricMode === 'COUNT'
                      ? (language === 'ku' ? 'ژمارەی ئامێرەکان بەپێی بنکە و دۆخی کارکردن' : 'Asset Fleet Breakdown per Project Site')
                      : (language === 'ku' ? 'بڕی وزەی بەکارهاتوو بە واتی کارەبا' : 'Total Power Draw per Project Site (Watts)')}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {barMetricMode === 'COUNT'
                    ? (language === 'ku' ? 'هەر ستوونێک دابەش دەبێت بەسەر ئامێرە کاراکان، ئەوانەی چاککردنەوەیان دەوێت و یه‌ده‌گەکان.' : 'Stacked segments display the proportion of operational vs maintenance hardware.')
                    : (language === 'ku' ? 'نیشاندانی بڕی وزەی کارەبای پێویست بۆ هەموو ئامێرەکان لە هەر شوێنێک.' : 'Aggregated rated power wattage footprint per physical location.')}
                </p>
              </div>

              {barMetricMode === 'COUNT' && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="font-semibold text-slate-700">Operational</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-rose-500" />
                    <span className="font-semibold text-slate-700">Maintenance</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-indigo-500" />
                    <span className="font-semibold text-slate-700">Standby</span>
                  </span>
                </div>
              )}
            </div>

            <div className="w-full overflow-x-auto bg-slate-50/50 rounded-2xl p-2 border border-slate-100">
              <svg ref={barChartSvgRef} className="w-full h-auto min-h-[440px]" />
            </div>
          </div>
        )}

        {/* VIEW 3: D3 RADIAL DONUT & TYPE DISTRIBUTION */}
        {activeViewMode === 'DONUT' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  <span>{language === 'ku' ? 'ڕێژەی دۆخی فلیتی ئامێرەکان' : 'Fleet Maintenance Readiness Donut & Category Analysis'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ku'
                    ? 'ڕێژەی سەدی ئامێرە کاراکان لە بەرامبەر ئەوانەی لەژێر پشکنین و چاککردنەوەدان لەگەڵ جیاکردنەوەی جۆری کەلوپەل.'
                    : 'Overall percentage share of operational, maintenance, and standby assets across the conglomerate.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Radial Donut SVG Canvas */}
              <div className="lg:col-span-5 flex justify-center bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <svg ref={donutSvgRef} className="w-full max-w-[420px] h-auto" />
              </div>

              {/* Status Breakdown & Hardware Category Breakdown */}
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {data?.statusDonutData.map(item => (
                    <div
                      key={item.status}
                      className="p-4 rounded-2xl border transition shadow-xs"
                      style={{
                        borderColor: `${item.color}40`,
                        backgroundColor: `${item.color}08`
                      }}
                    >
                      <span className="text-xs font-bold block" style={{ color: item.color }}>
                        {language === 'ku' ? item.labelKu : item.labelEn}
                      </span>
                      <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                        {item.count}
                        <span className="text-xs font-normal text-slate-500 ml-1">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Device Type Distribution Progress Bars */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {language === 'ku' ? 'دابەشبوون بەپێی جۆری ئامێر' : 'Breakdown by Device Category'}
                  </h4>

                  <div className="space-y-2.5">
                    {data?.typeDistribution.map(cat => (
                      <div key={cat.type} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{cat.type}</span>
                          <span className="font-mono text-slate-600 font-semibold">
                            {cat.operational} active / {cat.count} total
                            {cat.maintenance > 0 && (
                              <span className="text-rose-600 font-bold ml-1.5">({cat.maintenance} needs repair)</span>
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${(cat.operational / cat.count) * 100}%` }}
                            title={`Operational: ${cat.operational}`}
                          />
                          <div
                            className="bg-rose-500 h-full"
                            style={{ width: `${(cat.maintenance / cat.count) * 100}%` }}
                            title={`Maintenance: ${cat.maintenance}`}
                          />
                          <div
                            className="bg-indigo-500 h-full"
                            style={{ width: `${((cat.count - cat.operational - cat.maintenance) / cat.count) * 100}%` }}
                            title="Standby"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: D3 FORCE-DIRECTED NETWORK TOPOLOGY */}
        {activeViewMode === 'TOPOLOGY' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-600" />
                  <span>{language === 'ku' ? 'تۆپۆلۆجی فیزیکی بەستنەوەی سێرڤەرەکان بە هۆڵدینگ' : 'Force-Directed IT Topology & Asset Mesh'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ku'
                    ? 'پەیوەندی ڕاستەوخۆی نێوان سەنتەری داتای هۆڵدینگ (ناوەند)، ٧ وێستگەی مەیدانی، و ئامێرە بەستراوەکان. دەتوانیت گۆیەکان ڕابکێشیت (Drag & Drop) و نزیک و دووری بکەیتەوە (Zoom).'
                    : 'Interactive physical graph linking Central HQ Datacenter to 7 site gateways and individual hardware nodes. Nodes can be dragged and zoomed freely.'}
                </p>
              </div>

              {/* Topology Legend */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-950 border border-white" />
                  <span className="font-semibold text-slate-700">Central Datacenter</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="font-semibold text-slate-700">Site Gateway</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-700">Active Asset</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-semibold text-slate-700">Maintenance Alert</span>
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-900/5 rounded-2xl border border-slate-200 relative overflow-hidden">
              <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] text-slate-600 font-semibold shadow-xs">
                💡 {language === 'ku' ? 'بۆ نزیککردنەوە سکڕۆڵ بکە، یان گۆیەکان ڕابکێشە' : 'Scroll to zoom, drag nodes to inspect'}
              </div>
              <svg ref={topologySvgRef} className="w-full h-auto min-h-[500px]" />
            </div>
          </div>
        )}
      </div>

      {/* Selected Asset Modal / Quick Action Drawer */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800">
                    {selectedAssetDetail.name}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedAssetDetail.status === 'OPERATIONAL_ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedAssetDetail.status === 'MAINTENANCE_REQUIRED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {selectedAssetDetail.status}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-2">
                  {selectedAssetDetail.model}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedAssetDetail.isFlaggedHighRisk && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                <div className="flex items-center justify-between font-extrabold">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>FLAGGED HIGH RISK ASSET</span>
                  </span>
                  <span className="font-mono text-rose-700">Risk Score: {selectedAssetDetail.riskScore || 75}/100</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-tight">
                  {selectedAssetDetail.isOverdue 
                    ? (language === 'ku' ? 'پشکنینی چاککردنەوەی ئەم ئامێرە دواکەوتووە لە وادەی خۆی.' : 'Scheduled maintenance inspection is past due SLA threshold.')
                    : (language === 'ku' ? 'ئامێرەکە نمرەی سنوری مەترسی تێپەڕاندووە و ئاگاداری بۆ نێردراوە.' : 'Compounding hardware degradation flags detected.')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Category</span>
                <span className="font-bold text-slate-800">{selectedAssetDetail.deviceType}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">IP Address</span>
                <span className="font-mono font-bold text-blue-600">{selectedAssetDetail.ip}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Power Rating</span>
                <span className="font-mono font-bold text-slate-800">{selectedAssetDetail.value} Watts</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Criticality Tier</span>
                <span className="font-bold text-amber-700">{selectedAssetDetail.criticality}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                {language === 'ku' ? 'گۆڕینی ڕاستەوخۆی دۆخ بۆ تاقیکردنەوەی D3:' : 'Simulate status transition on D3 canvas:'}
              </div>
              <button
                disabled={isSimulating}
                onClick={async () => {
                  await handleSimulateStatus(
                    selectedAssetDetail.id,
                    selectedAssetDetail.status === 'OPERATIONAL_ACTIVE' ? 'MAINTENANCE_REQUIRED' : 'OPERATIONAL_ACTIVE'
                  );
                  setSelectedAssetDetail(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  selectedAssetDetail.status === 'OPERATIONAL_ACTIVE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>
                  {selectedAssetDetail.status === 'OPERATIONAL_ACTIVE'
                    ? (language === 'ku' ? 'گواستنەوە بۆ چاککردنەوە' : 'Mark Maintenance')
                    : (language === 'ku' ? 'گواستنەوە بۆ چالاک' : 'Mark Operational')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
