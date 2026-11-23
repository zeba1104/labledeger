import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Layers, 
  Thermometer, 
  Plus, 
  ChevronRight, 
  Search, 
  Trash2, 
  Sparkles, 
  Info,
  CheckCircle2,
  FolderTree,
  Building,
  Archive
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StorageMap({ 
  onOpenSampleDetails, 
  onRegisterInSlot,
  onOpenAddStorageNode
}) {
  const { permissions } = useAuth();
  const [treeData, setTreeData] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState('');
  const [boxGridData, setBoxGridData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBox, setLoadingBox] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Drilldown selection state
  const [activeRoomId, setActiveRoomId] = useState('');
  const [activeFreezerId, setActiveFreezerId] = useState('');
  const [activeShelfId, setActiveShelfId] = useState('');
  const [activeRackId, setActiveRackId] = useState('');

  useEffect(() => {
    loadStorageHierarchy();
  }, []);

  const loadStorageHierarchy = async () => {
    try {
      setLoading(true);
      const res = await api.getStorageTree();
      setTreeData(res.tree || []);
      setAllNodes(res.allNodes || []);

      // Auto select first room and box
      const rooms = (res.tree || []).filter(n => n.type === 'room');
      if (rooms.length > 0) {
        setActiveRoomId(rooms[0]._id);
      }

      const boxes = (res.allNodes || []).filter(n => n.type === 'box');
      if (boxes.length > 0) {
        setSelectedBoxId(boxes[0]._id);
      }
    } catch (err) {
      console.error('Error loading storage tree:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBoxId) {
      loadBoxGrid(selectedBoxId);
    }
  }, [selectedBoxId]);

  const loadBoxGrid = async (boxId) => {
    try {
      setLoadingBox(true);
      const res = await api.getBoxGrid(boxId);
      setBoxGridData(res);
    } catch (err) {
      console.error('Error loading box grid:', err);
    } finally {
      setLoadingBox(false);
    }
  };

  const handleCellClick = (cell) => {
    if (cell.isOccupied && cell.sample) {
      onOpenSampleDetails(cell.sample);
    } else {
      if (permissions.canRegisterSample) {
        onRegisterInSlot({
          boxId: selectedBoxId,
          position: cell.position,
          path: boxGridData?.box?.path
        });
      }
    }
  };

  // Color mapping by specimen type
  const typeBadgeColors = {
    Blood: 'bg-red-500 text-white',
    DNA: 'bg-indigo-600 text-white',
    RNA: 'bg-rose-600 text-white',
    Serum: 'bg-blue-600 text-white',
    Enzyme: 'bg-amber-600 text-white',
    'Cell Culture': 'bg-emerald-600 text-white',
    Saliva: 'bg-cyan-600 text-white',
    Proteins: 'bg-purple-600 text-white'
  };

  const boxes = allNodes.filter(n => n.type === 'box');
  const activeBox = allNodes.find(n => n._id === selectedBoxId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Storage Map
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
              5-Level Cold Chain
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Room &rarr; Freezer &rarr; Shelf &rarr; Rack &rarr; Box &rarr; Coordinate Slot (A1..I9)
          </p>
        </div>

        {/* Admin Storage Builder action */}
        {permissions.canManageStorage && (
          <button
            onClick={onOpenAddStorageNode}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Storage Element</span>
          </button>
        )}
      </div>

      {/* Drilldown Breadcrumb Hierarchy */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-slate-700">
            <Layers className="w-4 h-4 text-red-600" />
            <span>Active Cryogenic Coordinate:</span>
          </div>
          {activeBox && (
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-xs animate-frost flex items-center space-x-1">
                <Thermometer className="w-3 h-3 text-blue-600 animate-pulse" />
                <span>Temp: {activeBox.temperature || '-80°C'}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                Grid: {activeBox.gridRows || 9}x{activeBox.gridCols || 9} ({activeBox.capacity || 81} slots)
              </span>
            </div>
          )}
        </div>

        {/* Hierarchy Path Badge */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 text-xs overflow-x-auto">
          <span className="font-semibold text-red-700">{activeBox?.path || 'Main Bio-Repository 104 > Ultra-Low Cryo Freezer (-80°C #1)'}</span>
        </div>

        {/* Box Selector Pills */}
        <div className="pt-1 flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Select Box:
          </span>
          {boxes.map(box => {
            const isSelected = selectedBoxId === box._id;
            return (
              <button
                key={box._id}
                onClick={() => setSelectedBoxId(box._id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>{box.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Box Visual Grid & Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive 9x9 / 8x12 Matrix */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <span>{activeBox?.name || 'CryoBox Grid Matrix'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Click on an occupied cell to inspect forensic history, or an empty cell to store a new sample.
                </p>
              </div>

              {boxGridData?.dimensions && (
                <div className="text-right text-xs">
                  <span className="font-extrabold text-slate-900">{boxGridData.dimensions.occupiedSlots}</span>
                  <span className="text-slate-400"> / {boxGridData.dimensions.totalSlots} Slots</span>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    {Math.round((boxGridData.dimensions.occupiedSlots / boxGridData.dimensions.totalSlots) * 100)}% Occupied
                  </div>
                </div>
              )}
            </div>

            {/* Matrix Visualization */}
            {loadingBox ? (
              <div className="p-16 text-center text-slate-400 text-xs">
                <div className="inline-block w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p>Generating cryogenic slot coordinates...</p>
              </div>
            ) : !boxGridData ? (
              <div className="p-12 text-center text-slate-400 text-xs">No storage grid data found.</div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="inline-block min-w-full">
                  {/* Column Numbers Header */}
                  <div className="flex items-center mb-1.5 pl-6 sm:pl-8 space-x-1 sm:space-x-1.5">
                    {Array.from({ length: boxGridData.dimensions?.cols || 9 }, (_, i) => (
                      <div 
                        key={i} 
                        className="w-7 h-5 sm:w-9 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-400 font-mono"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  {/* Grid Rows */}
                  <div className="space-y-1 sm:space-y-1.5">
                    {boxGridData.grid.map((row) => (
                      <div key={row.rowName} className="flex items-center space-x-1 sm:space-x-1.5">
                        {/* Row Letter Header */}
                        <div className="w-5 sm:w-6 flex items-center justify-center text-xs font-bold text-slate-400 font-mono flex-shrink-0">
                          {row.rowName}
                        </div>

                        {/* Row Cells */}
                        {row.cells.map((cell) => {
                          const isOccupied = cell.isOccupied;
                          const sample = cell.sample;
                          const isHovered = hoveredCell?.position === cell.position;

                          return (
                            <button
                              key={cell.position}
                              onClick={() => handleCellClick(cell)}
                              onMouseEnter={() => setHoveredCell(cell)}
                              onMouseLeave={() => setHoveredCell(null)}
                              title={isOccupied ? `${sample.sampleId}: ${sample.name}` : `Empty slot ${cell.position}`}
                              className={`
                                w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold transition-all duration-200 relative
                                ${isOccupied 
                                  ? `${typeBadgeColors[sample.type] || 'bg-red-600 text-white'} shadow-xs hover:scale-125 hover:z-20 hover:shadow-lg ring-2 ring-transparent hover:ring-red-400 cursor-pointer` 
                                  : 'bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-red-700 border border-slate-200/80 hover:border-red-300 hover:scale-110 hover:z-10'
                                }
                              `}
                            >
                              {cell.position}

                              {/* Tiny indicator dot for occupied */}
                              {isOccupied && (
                                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white opacity-90 animate-ping" />
                              )}
                              {isOccupied && (
                                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white opacity-90" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color Legend */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[10px] font-bold">
            <span className="text-slate-400 uppercase tracking-wider mr-1">Legend:</span>
            {Object.entries(typeBadgeColors).map(([t, colorClass]) => (
              <div key={t} className="flex items-center space-x-1">
                <span className={`w-3 h-3 rounded ${colorClass.split(' ')[0]}`} />
                <span className="text-slate-600">{t}</span>
              </div>
            ))}
            <div className="flex items-center space-x-1 ml-2">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
              <span className="text-slate-400">Empty Slot</span>
            </div>
          </div>
        </div>

        {/* Right Column: Slot Inspector / Specimen Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Slot Inspector
              </h4>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                {hoveredCell ? hoveredCell.position : 'Hover or Click Slot'}
              </span>
            </div>

            {hoveredCell && hoveredCell.isOccupied ? (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200">
                  <span className="font-mono font-extrabold text-sm text-red-800">
                    {hoveredCell.sample.sampleId}
                  </span>
                  <div className="font-bold text-slate-900 mt-1">{hoveredCell.sample.name}</div>
                  <div className="mt-1 flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.2 bg-white text-red-700 rounded font-semibold text-[10px] border border-red-200">
                      {hoveredCell.sample.type}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {hoveredCell.sample.quantity} {hoveredCell.sample.unit}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>Registered By: <b className="text-slate-700">{hoveredCell.sample.registeredBy}</b></div>
                  <div>Stored Date: <b className="text-slate-700">{new Date(hoveredCell.sample.createdAt).toLocaleDateString()}</b></div>
                </div>

                <button
                  onClick={() => onOpenSampleDetails(hoveredCell.sample)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center space-x-1"
                >
                  <span>View Full Specimen Story</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            ) : hoveredCell && !hoveredCell.isOccupied ? (
              <div className="p-6 text-center text-slate-400 text-xs animate-fade-in">
                <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">Slot {hoveredCell.position} is Empty</p>
                <p className="text-[11px] text-slate-400 mt-1">Available for cryogenic sample placement.</p>
                {permissions.canRegisterSample && (
                  <button
                    onClick={() => onRegisterInSlot({
                      boxId: selectedBoxId,
                      position: hoveredCell.position,
                      path: boxGridData?.box?.path
                    })}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors inline-flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Store Specimen Here</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Info className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p>Hover over or click any coordinate in the grid above to view detailed specimen identity and storage chain.</p>
              </div>
            )}
          </div>

          {/* Hierarchy Tree Overview */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
              <FolderTree className="w-4 h-4 mr-1.5 text-red-600" />
              <span>Biobank Storage Rooms</span>
            </h4>
            <div className="space-y-2 text-xs">
              {treeData.map(node => (
                <div key={node._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{node.name}</span>
                    <span className="text-[10px] text-red-600 font-semibold">{node.sampleCount || 0} Samples</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{node.notes || 'Laboratory Facility'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
