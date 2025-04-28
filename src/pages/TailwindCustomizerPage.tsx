import React, { useState, useEffect } from 'react';
import { Palette, Type, Layout, Moon, Sun, Spacing } from 'lucide-react';

const TailwindCustomizerPage: React.FC = () => {
  // State variables for all customizable properties
  const [primaryColor, setPrimaryColor] = useState('#3366FF');
  const [secondaryColor, setSecondaryColor] = useState('#7B61FF');
  const [accentColor, setAccentColor] = useState('#FF977B');
  const [successColor, setSuccessColor] = useState('#2ECC71');
  const [warningColor, setWarningColor] = useState('#F1C40F');
  const [errorColor, setErrorColor] = useState('#E74C3C');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#263244');
  const [borderColor, setBorderColor] = useState('#E2E8F0');
  const [cardColor, setCardColor] = useState('#F1F5F9');
  const [inputColor, setInputColor] = useState('#F8FAFC');
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [fontSize, setFontSize] = useState('16px');
  const [smBreakpoint, setSmBreakpoint] = useState('640px');
  const [mdBreakpoint, setMdBreakpoint] = useState('768px');
  const [lgBreakpoint, setLgBreakpoint] = useState('1024px');
  const [xlBreakpoint, setXlBreakpoint] = useState('1280px');
  const [padding, setPadding] = useState('16px');
  const [margin, setMargin] = useState('16px');
  const [darkMode, setDarkMode] = useState(false);

  // State to store the last applied customizations
  const [lastCustomizations, setLastCustomizations] = useState(null);

  // Function to apply CSS variables to the root element
  const applyCustomizations = () => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-secondary', secondaryColor);
    root.style.setProperty('--color-accent', accentColor);
    root.style.setProperty('--color-success', successColor);
    root.style.setProperty('--color-warning', warningColor);
    root.style.setProperty('--color-error', errorColor);
    root.style.setProperty('--color-background', backgroundColor);
    root.style.setProperty('--color-text', textColor);
    root.style.setProperty('--color-border', borderColor);
    root.style.setProperty('--color-card', cardColor);
    root.style.setProperty('--color-input', inputColor);
    root.style.setProperty('--font-family', fontFamily);
    root.style.setProperty('--font-size', fontSize);
    root.style.setProperty('--sm-breakpoint', smBreakpoint);
    root.style.setProperty('--md-breakpoint', mdBreakpoint);
    root.style.setProperty('--lg-breakpoint', lgBreakpoint);
    root.style.setProperty('--xl-breakpoint', xlBreakpoint);
    root.style.setProperty('--padding', padding);
    root.style.setProperty('--margin', margin);

    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Load customizations from localStorage on component mount
  useEffect(() => {
    const storedPrimaryColor = localStorage.getItem('primaryColor') || '#3366FF';
    const storedSecondaryColor = localStorage.getItem('secondaryColor') || '#7B61FF';
    const storedAccentColor = localStorage.getItem('accentColor') || '#FF977B';
    const storedSuccessColor = localStorage.getItem('successColor') || '#2ECC71';
    const storedWarningColor = localStorage.getItem('warningColor') || '#F1C40F';
    const storedErrorColor = localStorage.getItem('errorColor') || '#E74C3C';
    const storedBackgroundColor = localStorage.getItem('backgroundColor') || '#FFFFFF';
    const storedTextColor = localStorage.getItem('textColor') || '#263244';
    const storedBorderColor = localStorage.getItem('borderColor') || '#E2E8F0';
    const storedCardColor = localStorage.getItem('cardColor') || '#F1F5F9';
    const storedInputColor = localStorage.getItem('inputColor') || '#F8FAFC';
    const storedFontFamily = localStorage.getItem('fontFamily') || 'Inter, sans-serif';
    const storedFontSize = localStorage.getItem('fontSize') || '16px';
    const storedSmBreakpoint = localStorage.getItem('smBreakpoint') || '640px';
    const storedMdBreakpoint = localStorage.getItem('mdBreakpoint') || '768px';
    const storedLgBreakpoint = localStorage.getItem('lgBreakpoint') || '1024px';
    const storedXlBreakpoint = localStorage.getItem('xlBreakpoint') || '1280px';
    const storedPadding = localStorage.getItem('padding') || '16px';
    const storedMargin = localStorage.getItem('margin') || '16px';
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';

    setPrimaryColor(storedPrimaryColor);
    setSecondaryColor(storedSecondaryColor);
    setAccentColor(storedAccentColor);
    setSuccessColor(storedSuccessColor);
    setWarningColor(storedWarningColor);
    setErrorColor(storedErrorColor);
    setBackgroundColor(storedBackgroundColor);
    setTextColor(storedTextColor);
    setBorderColor(storedBorderColor);
    setCardColor(storedCardColor);
    setInputColor(storedInputColor);
    setFontFamily(storedFontFamily);
    setFontSize(storedFontSize);
    setSmBreakpoint(storedSmBreakpoint);
    setMdBreakpoint(storedMdBreakpoint);
    setLgBreakpoint(storedLgBreakpoint);
    setXlBreakpoint(storedXlBreakpoint);
    setPadding(storedPadding);
    setMargin(storedMargin);
    setDarkMode(storedDarkMode);

    // Store initial customizations
    setLastCustomizations({
      primaryColor: storedPrimaryColor,
      secondaryColor: storedSecondaryColor,
      accentColor: storedAccentColor,
      successColor: storedSuccessColor,
      warningColor: storedWarningColor,
      errorColor: storedErrorColor,
      backgroundColor: storedBackgroundColor,
      textColor: storedTextColor,
      borderColor: storedBorderColor,
      cardColor: storedCardColor,
      inputColor: storedInputColor,
      fontFamily: storedFontFamily,
      fontSize: storedFontSize,
      smBreakpoint: storedSmBreakpoint,
      mdBreakpoint: storedMdBreakpoint,
      lgBreakpoint: storedLgBreakpoint,
      xlBreakpoint: storedXlBreakpoint,
      padding: storedPadding,
      margin: storedMargin,
      darkMode: storedDarkMode,
    });
  }, []);

  const revertToLastCustomizations = () => {
    if (lastCustomizations) {
      setPrimaryColor(lastCustomizations.primaryColor);
      setSecondaryColor(lastCustomizations.secondaryColor);
      setAccentColor(lastCustomizations.accentColor);
      setSuccessColor(lastCustomizations.successColor);
      setWarningColor(lastCustomizations.warningColor);
      setErrorColor(lastCustomizations.errorColor);
      setBackgroundColor(lastCustomizations.backgroundColor);
      setTextColor(lastCustomizations.textColor);
      setBorderColor(lastCustomizations.borderColor);
      setCardColor(lastCustomizations.cardColor);
      setInputColor(lastCustomizations.inputColor);
      setFontFamily(lastCustomizations.fontFamily);
      setFontSize(lastCustomizations.fontSize);
      setSmBreakpoint(lastCustomizations.smBreakpoint);
      setMdBreakpoint(lastCustomizations.mdBreakpoint);
      setLgBreakpoint(lastCustomizations.lgBreakpoint);
      setXlBreakpoint(lastCustomizations.xlBreakpoint);
      setPadding(lastCustomizations.padding);
      setMargin(lastCustomizations.margin);
      setDarkMode(lastCustomizations.darkMode);
    }
  };

  const handleApply = () => {
    applyCustomizations();
    localStorage.setItem('primaryColor', primaryColor);
    localStorage.setItem('secondaryColor', secondaryColor);
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('successColor', successColor);
    localStorage.setItem('warningColor', warningColor);
    localStorage.setItem('errorColor', errorColor);
    localStorage.setItem('backgroundColor', backgroundColor);
    localStorage.setItem('textColor', textColor);
    localStorage.setItem('borderColor', borderColor);
    localStorage.setItem('cardColor', cardColor);
    localStorage.setItem('inputColor', inputColor);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('smBreakpoint', smBreakpoint);
    localStorage.setItem('mdBreakpoint', mdBreakpoint);
    localStorage.setItem('lgBreakpoint', lgBreakpoint);
    localStorage.setItem('xlBreakpoint', xlBreakpoint);
    localStorage.setItem('padding', padding);
    localStorage.setItem('margin', margin);
    localStorage.setItem('darkMode', darkMode.toString());

    setLastCustomizations({
      primaryColor,
      secondaryColor,
      accentColor,
      successColor,
      warningColor,
      errorColor,
      backgroundColor,
      textColor,
      borderColor,
      cardColor,
      inputColor,
      fontFamily,
      fontSize,
      smBreakpoint,
      mdBreakpoint,
      lgBreakpoint,
      xlBreakpoint,
      padding,
      margin,
      darkMode,
    });
  };

  const previewStyle = {
    color: textColor,
    fontFamily: fontFamily,
    fontSize: fontSize,
    padding: padding,
    margin: margin,
    backgroundColor: cardColor,
    border: `1px solid ${borderColor}`,
  };

  return (
    <div className="p-6 overflow-auto h-full"> {/* Added overflow-auto and h-full */}
      <div className="flex justify-between mb-4">
        <button onClick={revertToLastCustomizations} className="btn btn-outline">
          Reverter para a Última Customização
        </button>
        <button onClick={handleApply} className="btn btn-primary">
          Aplicar
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Customização do Tailwind CSS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cores */}
        <div className="bg-card rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Palette size={18} /> Cores</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Cor Primária</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor Secundária</label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor de Acento</label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor de Sucesso</label>
              <input
                type="color"
                value={successColor}
                onChange={(e) => setSuccessColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor de Aviso</label>
              <input
                type="color"
                value={warningColor}
                onChange={(e) => setWarningColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor de Erro</label>
              <input
                type="color"
                value={errorColor}
                onChange={(e) => setErrorColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor de Fundo</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor do Texto</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor da Borda</label>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor do Card</label>
              <input
                type="color"
                value={cardColor}
                onChange={(e) => setCardColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor do Input</label>
              <input
                type="color"
                value={inputColor}
                onChange={(e) => setInputColor(e.target.value)}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Tipografia */}
        <div className="bg-card rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Type size={18} /> Tipografia</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Família da Fonte</label>
              <input
                type="text"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tamanho da Fonte</label>
              <input
                type="text"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Espaçamento */}
        <div className="bg-card rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Layout size={18} /> Espaçamento</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Padding</label>
              <input
                type="range"
                min="0"
                max="64"
                value={parseInt(padding)}
                onChange={(e) => setPadding(`${e.target.value}px`)}
                className="w-full"
              />
              <span className="text-xs text-text/70">{padding}</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Margin</label>
              <input
                type="range"
                min="0"
                max="64"
                value={parseInt(margin)}
                onChange={(e) => setMargin(`${e.target.value}px`)}
                className="w-full"
              />
              <span className="text-xs text-text/70">{margin}</span>
            </div>
          </div>
        </div>

        {/* Breakpoints */}
        <div className="bg-card rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Layout size={18} /> Breakpoints</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">sm (Small)</label>
              <input
                type="text"
                value={smBreakpoint}
                onChange={(e) => setSmBreakpoint(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
              />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">md (Medium)</label>
              <input
                type="text"
                value={mdBreakpoint}
                onChange={(e) => setMdBreakpoint(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
              />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">lg (Large)</label>
              <input
                type="text"
                value={lgBreakpoint}
                onChange={(e) => setLgBreakpoint(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
              />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">xl (Extra Large)</label>
              <input
                type="text"
                value={xlBreakpoint}
                onChange={(e) => setXlBreakpoint(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-input focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="bg-card rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Moon size={18} /> Modo Escuro</h2>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Ativar Modo Escuro</label>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Visualização</h2>
        <p style={previewStyle}>Este é um texto de visualização. Altere as configurações acima para ver o resultado.</p>
         <div className="mt-4">
           <button className="btn btn-primary" style={{ backgroundColor: primaryColor }}>Botão de Exemplo</button>
         </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={revertToLastCustomizations} className="btn btn-outline">
          Reverter para a Última Customização
        </button>
        <button onClick={() => {
          const config = {
            primaryColor,
            secondaryColor,
            accentColor,
            successColor,
            warningColor,
            errorColor,
            backgroundColor,
            textColor,
            borderColor,
            cardColor,
            inputColor,
            fontFamily,
            fontSize,
            smBreakpoint,
            mdBreakpoint,
            lgBreakpoint,
            xlBreakpoint,
          };
          generateCss(config);
          alert('Configurações salvas! Reinicie o servidor para ver as mudanças.');
        }} className="btn btn-primary">Salvar</button>
      </div>
    </div>
  );
};

export default TailwindCustomizerPage;
