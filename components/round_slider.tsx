type RoundSliderProps = {
  maxRounds: number;
  selectedRound: number;
  onChange: (round: number) => void;
};

export default function RoundSlider({ maxRounds, selectedRound, onChange }: RoundSliderProps) {
return (
    <div className="round-slider-container">
      <label className="round-slider-label">
        Round: {selectedRound}
      </label>
      <div className="round-slider-wrapper">
        <input
          type="range"
          min="0"
          max={maxRounds}
          value={selectedRound}
          onChange={(e) => onChange(Number(e.target.value))}
          className="round-slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(selectedRound / maxRounds) * 100}%, #e5e7eb ${(selectedRound / maxRounds) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="slider-labels">
          <span>0</span>
          <span className="slider-middle-label">{Math.floor(maxRounds / 2)}</span>
          <span>{maxRounds}</span>
        </div>
      </div>
      
      <div className="mobile-controls">
        <button
          onClick={() => onChange(Math.max(0, selectedRound - 1))}
          disabled={selectedRound === 0}
          className="mobile-btn"
        >
          ← Prev
        </button>
        <button
          onClick={() => onChange(Math.min(maxRounds, selectedRound + 1))}
          disabled={selectedRound === maxRounds}
          className="mobile-btn"
        >
          Next →
        </button>
      </div>
    </div>
  );
}