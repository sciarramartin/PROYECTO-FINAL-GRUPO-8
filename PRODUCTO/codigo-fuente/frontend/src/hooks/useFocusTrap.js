import { useEffect, useRef } from 'react';

/**
 * Hook para mantener el foco atrapado en un modal y cerrarlo con la tecla Escape (WCAG 2.1 AA)
 * @param {boolean} isOpen - Estado que indica si el modal está visible
 * @param {function} onClose - Función que se ejecuta al presionar Escape
 * @returns {React.RefObject} - Ref para asociar al contenedor del modal
 */
export const useFocusTrap = (isOpen, onClose) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const container = containerRef.current;
        if (!container) return;

        // Guardar el elemento previamente enfocado para restaurarlo al cerrar
        const previouslyFocusedElement = document.activeElement;

        // Selector exhaustivo de elementos interactivos enfocables
        const focusableSelector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        const getFocusableElements = () => {
            const elements = Array.from(container.querySelectorAll(focusableSelector));
            return elements.filter(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
        };

        // Enfocar el primer elemento interactivo disponible al abrir
        const timer = setTimeout(() => {
            const focusables = getFocusableElements();
            if (focusables.length > 0) {
                focusables[0].focus();
            } else {
                container.setAttribute('tabindex', '-1');
                container.focus();
            }
        }, 50);

        const handleKeyDown = (e) => {
            // Cierre accesible al presionar Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                if (onClose) onClose();
                return;
            }

            // Atrapamiento de foco al presionar Tab
            if (e.key === 'Tab') {
                const currentFocusables = getFocusableElements();
                if (currentFocusables.length === 0) {
                    e.preventDefault();
                    return;
                }

                const firstElement = currentFocusables[0];
                const lastElement = currentFocusables[currentFocusables.length - 1];

                if (e.shiftKey) {
                    // Shift + Tab: navegando hacia atrás
                    if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab: navegando hacia adelante
                    if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('keydown', handleKeyDown, true);
            // Restaurar foco al elemento que abrió el modal
            if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
                previouslyFocusedElement.focus();
            }
        };
    }, [isOpen, onClose]);

    return containerRef;
};

export default useFocusTrap;
