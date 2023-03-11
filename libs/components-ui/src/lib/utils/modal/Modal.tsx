import ReactDOM from 'react-dom';
import { IModalProps } from './ModalProps';
import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';

const ModalRoot = styled.div<{ ownerState: IModalProps }>(({ ownerState }) => ({
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  inset: 0,
  ...(!ownerState.hideBackdrop && {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }),
}));

function Modal(props: IModalProps) {
  const { open = false, hideBackdrop = false, onClose, ...other } = props;

  const ownerState = {
    ...props,
    hideBackdrop,
  };

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        ref.current.firstChild &&
        !ref.current.firstChild.contains(event.target as Node)
      )
        onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);

    document.onkeydown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  if (!open) return null;

  const portalContainer =
    document.getElementById('portal-container') ||
    document.createElement('div');
  if (!document.getElementById('portal-container')) {
    portalContainer.setAttribute('id', 'portal-container');
    document.body.appendChild(portalContainer);
  }

  return ReactDOM.createPortal(
    <ModalRoot ref={ref} ownerState={ownerState} {...other} />,
    portalContainer
  );
}

export default Modal;
