import { Context } from '../boot';

export default function edit(ctx: Context): any {
  return [
    {
      label: ctx.translate('Edit'),
      submenu: [
        {
          label: ctx.translate('Undo'),
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: ctx.translate('Redo'),
          accelerator:
            process.platform !== 'darwin' ? 'CmdOrCtrl+Y' : 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: ctx.translate('Cut'),
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: ctx.translate('Copy'),
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: ctx.translate('Paste'),
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: ctx.translate('Select all'),
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        }
      ]
    }
  ];
}
