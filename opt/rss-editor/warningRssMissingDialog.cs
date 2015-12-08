using System;

namespace rss_editor
{
	public partial class warningRssMissingDialog : Gtk.Dialog
	{
		public warningRssMissingDialog ()
		{
			this.Build ();
		}

		protected void buttonOk_Clicked (object sender, System.EventArgs e)
		{
			this.Destroy();
		}
	}
}

