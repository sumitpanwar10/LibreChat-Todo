import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ListTodo } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { TooltipAnchor } from '~/components/ui';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface TodoNavLinkProps {
  isSmallScreen?: boolean;
  toggleNav?: () => void;
}

const TodoNavLink: React.FC<TodoNavLinkProps> = ({ isSmallScreen, toggleNav }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const localize = useLocalize();
  
  const isActive = location.pathname === '/todos';
  
  const handleClick = () => {
    navigate('/todos');
    if (isSmallScreen && toggleNav) {
      toggleNav();
    }
  };
  
  return (
    <TooltipAnchor
      description="Todos"
      render={
        <Button
          size="icon"
          variant="outline"
          data-testid="nav-todos-button"
          aria-label="Todos"
          className={cn(
            "rounded-full border-none bg-transparent p-2 hover:bg-surface-hover md:rounded-xl",
            isActive && "bg-surface-hover"
          )}
          onClick={handleClick}
        >
          <ListTodo className="icon-md md:h-6 md:w-6" />
        </Button>
      }
    />
  );
};

export default TodoNavLink;
