
namespace WinFormAtmSim
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.bStartSim = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // bStartSim
            // 
            this.bStartSim.Location = new System.Drawing.Point(13, 13);
            this.bStartSim.Name = "bStartSim";
            this.bStartSim.Size = new System.Drawing.Size(75, 23);
            this.bStartSim.TabIndex = 0;
            this.bStartSim.Text = "Start sim";
            this.bStartSim.UseVisualStyleBackColor = true;
            this.bStartSim.Click += new System.EventHandler(this.bStartSim_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.bStartSim);
            this.Name = "Form1";
            this.Text = "Form1";
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Button bStartSim;
    }
}

