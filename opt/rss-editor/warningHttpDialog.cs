using System;

namespace rss_editor
{
	public partial class warningHttpDialog : Gtk.Dialog
	{
		public warningHttpDialog ()
		{
			this.Build ();
		}

		protected void buttonOk_Clicked (object sender, System.EventArgs e)
		{
			this.Destroy();
		}
	}
}

