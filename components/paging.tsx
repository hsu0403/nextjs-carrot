import { cls } from "@libs/client/utils";

interface PagingProps {
  viewPage: number;
  viewBtn: number;
  countView: number;
  page: number;
  onValid: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onLeftClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onRightClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const PAGING_BTN = 5;

export default function Paging({
  viewPage,
  viewBtn,
  countView,
  page,
  onValid,
  onLeftClick,
  onRightClick,
}: PagingProps) {
  return (
    <div className="flex justify-around">
      <button
        disabled={viewBtn === 0 ? true : false}
        className={cls(
          viewBtn === 0 ? "text-gray-400 opacity-40" : "text-gray-700",
          "font-semibold"
        )}
        onClick={onLeftClick}
      >
        left
      </button>
      <div className="flex space-x-5">
        {[...Array.from(Array(viewPage).keys())]
          .slice(
            viewBtn * PAGING_BTN,
            viewBtn !== countView
              ? PAGING_BTN * (viewBtn + 1)
              : viewBtn * PAGING_BTN + (viewPage % PAGING_BTN)
          )
          .map((i) => (
            <button
              className={cls(
                page === i + 1 ? "text-orange-500 font-semibold" : ""
              )}
              onClick={onValid}
              key={i}
              value={i + 1}
            >
              {i + 1}
            </button>
          ))}
      </div>
      <button
        disabled={viewBtn === countView ? true : false}
        className={cls(
          viewBtn === countView ? "text-gray-400 opacity-40" : "text-gray-700",
          "font-semibold"
        )}
        onClick={onRightClick}
      >
        right
      </button>
    </div>
  );
}
