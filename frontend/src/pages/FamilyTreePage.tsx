import { useGameStore } from "../hooks/useGameStore";
import type { Kemonomimi } from "../types/game";

function renderFamilyTree(
  kemono: Kemonomimi,
  allKemono: Kemonomimi[],
  depth = 0,
) {
  const children = allKemono.filter(
    (k) => k.parents && k.parents.includes(kemono.id),
  );
  return (
    <div className="ml-4 border-l-2 border-gray-200 pl-4 mt-2" key={kemono.id}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{kemono.type.emoji}</span>
        <span className="font-semibold">{kemono.name}</span>
        <span className="text-xs text-gray-400">{kemono.type.name}</span>
      </div>
      {children.length > 0 && (
        <div className="ml-4">
          {children.map((child) =>
            renderFamilyTree(child, allKemono, depth + 1),
          )}
        </div>
      )}
    </div>
  );
}

export default function FamilyTreePage() {
  const kemonomimi = useGameStore((s) => s.kemonomimi);
  // Find root kemonomimi (no parents)
  const roots = kemonomimi.filter((k) => !k.parents || k.parents.length === 0);

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary">
        Family Tree
      </h2>
      <div className="family-tree-section bg-white rounded p-4 shadow">
        {roots.length === 0 ? (
          <div className="text-gray-400">
            Your kemonomimi family lineages will appear here as you breed them.
          </div>
        ) : (
          <div>{roots.map((root) => renderFamilyTree(root, kemonomimi))}</div>
        )}
      </div>
    </section>
  );
}
