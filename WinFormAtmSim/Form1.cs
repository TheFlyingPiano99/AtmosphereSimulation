using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WinFormAtmSim
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        [DllImport("AtmSimDll.dll", CallingConvention = CallingConvention.Cdecl)]
        public static extern void run();

        private void bStartSim_Click(object sender, EventArgs e)
        {
            run();
        }
    }
}
