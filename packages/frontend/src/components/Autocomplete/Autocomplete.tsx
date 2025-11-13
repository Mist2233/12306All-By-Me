import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import './Autocomplete.css';

export interface AutocompleteOption {
    station_id: number;
    station_code: string;
    station_name: string;
    pinyin: string;
    pinyin_abbr: string;
}

interface AutocompleteProps {
    options: AutocompleteOption[];
    onSelect?: (option: AutocompleteOption) => void;
    placeholder?: string;
    className?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
    options,
    onSelect,
    placeholder = '请输入车站名',
    className = '',
}) => {
    const [inputValue, setInputValue] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    // 搜索过滤逻辑
    useEffect(() => {
        if (!inputValue.trim()) {
            setFilteredOptions([]);
            setShowDropdown(false);
            return;
        }

        const keyword = inputValue.toLowerCase();
        const filtered = options.filter((option) => {
            return (
                option.station_name.includes(inputValue) ||
                option.pinyin.toLowerCase().includes(keyword) ||
                option.pinyin_abbr.toLowerCase().includes(keyword)
            );
        });

        setFilteredOptions(filtered);
        setShowDropdown(filtered.length > 0);
        setActiveIndex(-1);
    }, [inputValue, options]);

    // 键盘事件处理
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || filteredOptions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && filteredOptions[activeIndex]) {
                    handleSelectOption(filteredOptions[activeIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                break;
        }
    };

    // 选中选项
    const handleSelectOption = (option: AutocompleteOption) => {
        setInputValue(option.station_name);
        setShowDropdown(false);
        setActiveIndex(-1);
        onSelect?.(option);
    };

    // 输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    return (
        <div className={`autocomplete-container ${className}`}>
            <input
                ref={inputRef}
                type="text"
                className="autocomplete-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                role="textbox"
            />
            {showDropdown && filteredOptions.length > 0 && (
                <ul className="autocomplete-dropdown" role="listbox">
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option.station_id}
                            className={`autocomplete-option ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => handleSelectOption(option)}
                            role="option"
                            aria-selected={index === activeIndex}
                        >
                            <span className="station-name">{option.station_name}</span>
                            <span className="station-code">{option.station_code}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Autocomplete;
