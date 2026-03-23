import React from 'react';

import { Button } from '@/components/ui/button';

interface ActionPanelProps {
    onAction: (actionType: string) => void;
    disabled: boolean;
}

const ACTIONS = [
    { type: 'roll_dice', label: 'Roll' },
    { type: 'buy_property', label: 'Buy' },
    { type: 'pay_rent', label: 'Pay Rent' },
    { type: 'pass_turn', label: 'Pass' },
    { type: 'go_to_jail', label: 'Go Jail' },
    { type: 'pay_jail_fine', label: 'Pay Fine' },
    { type: 'use_jail_card', label: 'Use Card' },
    { type: 'collect_go', label: 'Collect GO' },
];

export const ActionPanel: React.FC<ActionPanelProps> = ({ onAction, disabled }) => {
    return (
        <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-4">
            <p className="mb-3 text-sm text-gray-400">Actions</p>
            <div className="flex flex-wrap gap-2">
                {ACTIONS.map((action) => (
                    <Button
                        key={action.type}
                        size="sm"
                        disabled={disabled}
                        onClick={() => onAction(action.type)}
                    >
                        {action.label}
                    </Button>
                ))}
            </div>
        </div>
    );
};
