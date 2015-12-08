using System;

namespace rss_editor
{
	public partial class successfulDialog : Gtk.Dialog
	{
		public successfulDialog ()
		{
			this.Build ();
		}

		protected void buttonOk_Clicked (object sender, System.EventArgs e)
		{
			this.Destroy();
		}
	}
}

